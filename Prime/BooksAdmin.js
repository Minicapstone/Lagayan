import React, { useState, useEffect } from "react";
import { supabase } from '../../utils/supabaseClient';
import { FaRegFilePdf } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BooksAdmin = () => {
  // Dropdown category and search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModalIssue, setShowModalIssue] = useState(false);

  // Category data
  const categories = [
    "All",
    "History and Geography",
    "Literature",
    "Psychology and Philosophy",
    "Natural Sciences",
  ];

  useEffect(() => {
    fetchBooks();
    fetchBookIssued();
    const interval = setInterval(() => {
      fetchBooks();
      fetchBookIssued();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenModalIssue = () => {
    setShowModalIssue(true);
  };

  // Pang select table
  const [selectedTable, setSelectedTable] = useState('Books');

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };

  // Pang fetch books 
  const [books, setBooks] = useState([]);
  const [bookIssued, setBookIssued] = useState([]);
  const [bookData, setBookData] = useState([]);
  const [studentNumber, setStudentNumber] = useState('');
  const [fullName, setFullname] = useState('');

  useEffect(() => {
    if (studentNumber) {
      fetchStudentInfo(studentNumber);
    }
  }, [studentNumber])

  useEffect(() => {
    fetchBooks();
    fetchBookIssued();
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('*');
    setBooks(data);
  }

  useEffect(() => {
    fetchBookIssued();
  }, []);

  async function fetchBookIssued() {
    try {
      const { data: borrowData, error } = await supabase
        .from('borrowbooks')
        .select('*');
  
      if (error) {
        throw error;
      }
  
      // Calculate status based on return date
      const currentDate = new Date();
      const updatedBorrowData = borrowData.map(async (borrow) => {
        const returnDate = new Date(borrow.return_date);
        if (returnDate < currentDate && borrow.status !== "Returned") {
          borrow.status = "Overdue";
          // Update the status in the database
          await supabase
            .from('borrowbooks')
            .update({ status: "Overdue" })
            .eq('transaction_id', borrow.transaction_id);
        }
        return borrow;
      });
  
      setBookIssued(await Promise.all(updatedBorrowData));
    } catch (error) {
      console.error('Error fetching book issued data:', error.message);
    }
  }
  
  

  const fetchStudentInfo = async (studentNumber) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('student_number', studentNumber)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setFullname(`${data.first_name} ${data.last_name}`);
      } else {
        setFullname('');
      }
    } catch (error) {
      console.error('Error fetching student info:', error.message);
    }
  };

  const displayBookIssue = (bookId) => {
    const book = books.find((book) => book.id === bookId);
    if (book) {
      setBookData({
        id: book.id,
        ddc_id: book.ddc_id,
        title: book.title,
      });
    }
  }
  
  const issueBook = async (e) => {
    e.preventDefault();
    try {
      if (!fullName) {
        toast.warn('Invalid student number or no account found.', {
          autoClose: 2000,
          hideProgressBar: true
        });
        return;
      }
  
      const { error } = await supabase.from('borrowbooks')
      .insert([
        {
          student_no: studentNumber,
          full_name: fullName,
          ddc_no: bookData.ddc_id,
          book_title: bookData.title,
          issue_date: e.target.issueDate.value,
          return_date: e.target.returnDate.value,
          status: "Issued" 
        }
      ]);
  
      if (error) {
        throw error;
      }
  
      // Update the availability of the book in the books table
      const { updateError } = await supabase
        .from('books')
        .update({ availability: false })
        .eq('id', bookData.id);
  
      if (updateError) {
        throw updateError;
      }
  
      toast.success("Issued successfully", {
        autoClose: 2000,
        hideProgressBar: true
      });
  
      setStudentNumber('');
      setFullname('');
      setShowModalIssue(false);
      fetchBookIssued();
      fetchBooks();
  
    } catch (error) {
      console.error('Error issuing book:', error.message);
      toast.error("Failed to issue book.", {
        autoClose: 2000,
        hideProgressBar: true
      });
    }
  };

  
  const markAsReturned = async (transactionId) => {
    try {
      const { error } = await supabase
        .from('borrowbooks')
        .update({ status: "Returned" }) 
        .eq('transaction_id', transactionId);
  
      if (error) {
        throw error;
      }

      const { updateError } = await supabase
        .from('books')
        .update({ availability: true })
        .eq('id', bookData.id);
  
      if (updateError) {
        throw updateError;
      }
  
      toast.success("Marked as returned successfully", {
        autoClose: 2000,
        hideProgressBar: true
      });
  
      fetchBookIssued();
      fetchBooks();
  
    } catch (error) {
      console.error('Error marking as returned:', error.message);
      toast.error("Failed to mark as returned.", {
        autoClose: 2000,
        hideProgressBar: true
      });
    }
  };

  // Dropdown category and search
  const filteredData = books.filter((book) =>
    (selectedCategory === "All" || book.category === selectedCategory) &&
    (
      (book.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.author?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const handleExport = () => {
    alert("Succesfully exported as PDF...");
  };

  return (
    <div className="px-5 flex-1">
      <div className="bg-white my-5 px-3 py-2 rounded-xl shadow flex justify-between search-container">
        <div className="flex items-center w-full">
          <BiSearch className="text-3xl mx-2 my-2" />

          <input
            type="text"
            placeholder="Search"
            className="w-3/4 px-4 py-2 border border-opacity-25 rounded-xl focus:outline-none focus:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

        </div>
        <select
          id="table"
          name="table"
          className="w-fit py-3 px-4 xl:ml-60 md:ml-32 bg-gray rounded-xl shadow-sm focus:outline-none sm:text-sm"
          value={selectedTable}
          onChange={handleTableChange}>
          <option value="Books">Books</option>
          <option value="Issue">Issue</option>
        </select>
      </div>

      {selectedTable === 'Books' && (
        <div className="admin-table overflow-y-auto rounded-xl custom-scrollbar">
          <table className="bg-white w-full rounded-lg px-2 py-2 shadow-xl">
            <thead>
              <tr className="pb-2">
                <th colSpan="10">
                  <div className="flex justify-between items-center px-5 py-4">
                    <h2 className="text-xl text-black">Book list</h2>
                    <select
                      id="category"
                      name="category"
                      className="w-fit py-3 px-4 xl:ml-4 bg-gray rounded-xl shadow-sm font-semibold sm:text-sm category "
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
              </tr>

              <tr className="text-left text-black text-lg border-b border-gray">
                <th className="px-5 py-4">DDC ID</th>
                <th className="px-5 py-4">Title of the book</th>
                <th className="px-5 py-4">Author</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
            {filteredData.map((book) => (
              <tr key={book.id} className="border-b border-gray text-sm">
                <td className="px-5 py-2">{book.ddc_id}</td>
                <td className="px-5 py-2">{book.title}</td>
                <td className="px-5 py-2">{book.author}</td>
                <td className="px-5 py-2">{book.category}</td>
                <td className={`px-1 py-2 text-center ${
                  book.availability ? "bg-green text-black" : "bg-red text-white"
                } m-2 inline-block rounded-xl text-sm w-3/4`}>
                  {book.availability ? "Available" : "Not Available"}
                </td>
                <td className="px-5">
                  <button className="text-sm text-white bg-blue font-normal px-4 py-2 my-2 rounded-lg hover:text-black" onClick={() => {
                    displayBookIssue(book.id);
                    handleOpenModalIssue();
                  }}>Issue</button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}

      {selectedTable === 'Issue' && (
        <div className="admin-table overflow-y-auto rounded-xl custom-scrollbar">
          <table className="bg-white w-full rounded-lg px-2 py-2 shadow-xl">
            <thead className="sticky top-0 bg-white">
              <tr className="pb-2">
                <th colSpan="10">
                  <div className="flex justify-between items-center px-5 py-4">
                    <h2 className="text-xl text-black">Book Issued</h2>
                    <button
                      onClick={handleExport}
                      className="bg-gray text-black text-sm p-3 flex items-center rounded-xl hover:bg-blue hover:text-white cursor-pointer">
                      <FaRegFilePdf className="mr-1" />
                      Export as PDF
                    </button>
                  </div>
                </th>
              </tr>

              <tr className="text-left text-black text-lg border-b border-gray">
                <th className="px-5 py-4">Student No.</th>
                <th className="px-5 py-4">Fullname</th>
                <th className="px-5 py-4">DDC ID</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Issue Date</th>
                <th className="px-5 py-4">Return Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {bookIssued.map((issue) => (
                <tr key={issue.transaction_id} className="border-b border-gray text-sm">
                  <td className="px-5 py-2">{issue.student_no}</td>
                  <td className="px-5 py-2">{issue.full_name}</td>
                  <td className="px-5 py-2">{issue.ddc_no}</td>
                  <td className="px-5 py-2">{issue.book_title}</td>
                  <td className="px-5 py-2">{issue.issue_date}</td>
                  <td className="px-5 py-2">{issue.return_date}</td>
                  <td className={`px-5 py-2 ${issue.status === 'Overdue' ? 'text-red' : 'text-black'}`}>
                    {issue.status}
                  </td>
                  <td className="px-5">
                  {issue.status === "Returned" ? (
                    <button className="text-sm text-green font-normal py-2 my-2  rounded-lg">
                      Already returned
                    </button>
                  ) : (
                    <button className="text-sm text-blue font-normal py-2 my-2  rounded-lg" onClick={() => markAsReturned(issue.transaction_id, issue.book_id)}>
                      Mark as Returned
                    </button>
                  )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModalIssue && (
        <div className="fixed inset-0 z-10 flex justify-center items-center shadow-2xl bg-black bg-opacity-50" onClick={() => setShowModalIssue(false)} >
          <div className="bg-white p-8 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Issue Book
            </h2>

            <form onSubmit={issueBook}>
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-sm m-1 font-semibold">
                    Student Number:
                  </label>
                  <input
                    type="number"
                    name="studentNumber"
                    placeholder="Student Number"
                    value={studentNumber}
                    required
                    className="shadow input-border rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    onChange={(e) => {
                      const value = e.target.value;
                      setStudentNumber(value);
                      if (!value) {
                        setFullname('');
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm m-1 font-semibold">
                    Fullname:
                  </label>
                  <input
                    type="text"
                    name="studentNumber"
                    value={fullName}
                    readOnly
                    placeholder="Fullname"
                    className="shadow input-border rounded-xl text-sm px-5 py-4 mb-4 w-full"
                  />
                </div>

                <div >
                  <label className="text-sm m-1 font-semibold">
                    DDC ID:
                  </label>
                  <input
                    type="number"
                    name="ddc_id"
                    defaultValue={bookData.ddc_id}
                    className="shadow input-border rounded-xl text-sm px-5 py-4 mb-4 w-full"
                  />
                </div>

                <div >
                  <label className="text-sm m-1 font-semibold">
                    Book Title:
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={bookData.title}
                    className="shadow input-border rounded-xl text-sm px-5 py-4 mb-4 w-full"
                  />
                </div>

                <div>
                  <label className="text-sm m-1 font-semibold">
                    Issue Date:
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    className="shadow input-border rounded-xl text-sm px-5 py-4 mb-4 w-full"
                  />
                </div>

                <div>
                  <label htmlFor="returnDate" className="text-sm m-1 font-semibold">Return Date:</label>
                  <input
                    type="date"
                    name="returnDate"
                    className="shadow input-border rounded-xl text-sm px-5 py-4 mb-4 w-full"
                  />
                </div>
              </div>


              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="bg-blue text-white font-semibold py-2 px-4  rounded-md shadow-sm mt-2">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksAdmin;
