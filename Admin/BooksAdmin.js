import React, { useState, useEffect } from "react";
import { supabase } from '../../utils/supabaseClient';
import { FaRegFilePdf } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BooksAdmin = () => {
  // Dropdown category and search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModalIssue, setShowModalIssue] = useState(false);

  const handleOpenModalIssue = () => {
    setShowModalIssue(true);
  };


  const [selectedTable, setSelectedTable] = useState('Books');

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };

  const [issuedBooks] = useState([
    {
      studentNumber: "123456",
      docId: "789",
      title: "Sample Book 1",
      issueDate: "2024-03-07",
      returnDate: "2024-03-21",
    },
    {
      studentNumber: "456789",
      docId: "012",
      title: "Sample Book 2",
      issueDate: "2024-03-08",
      returnDate: "2024-03-22",
    },
    {
      studentNumber: "110011",
      docId: "014",
      title: "Sample Book 3",
      issueDate: "2024-03-12",
      returnDate: "2024-03-22",
    },
  ]);

  const [overdueBooks] = useState([
    {
      studentNumber: "123456",
      name: "John Doe",
      docId: "DDC001",
      title: "Introduction to React",
      status: "Overdue",
    },
    {
      studentNumber: "654321",
      name: "Jane Smith",
      docId: "DDC002",
      title: "JavaScript Basics",
      status: "Overdue",
    },
    {
      studentNumber: "987654",
      name: "Alice Johnson",
      docId: "DDC003",
      title: "HTML Essentials",
      status: "Overdue",
    },
    {
      studentNumber: "246813",
      name: "Bob Johnson",
      docId: "DDC004",
      title: "CSS Mastery",
      status: "Overdue",
    },
  ]);

  // Category data
  const categories = [
    "All",
    "History and Geography",
    "Literature",
    "Psychology and Philosophy",
    "Natural Sciences",
  ];

  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const { data } = await supabase.from('books').select('*');
    setBooks(data);
  }


  // Dropdown category and search
  const filteredData = books.filter((book) =>
    (selectedCategory === "All" || book.category === selectedCategory) &&
    (
      (book.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.author?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const handleExport = (data, title, customHeaders) => {
    const doc = new jsPDF();
    const margin = 16;
  
    const addText = (text, x, y, size = 12) => {
      doc.setFont("Poppins", "sans-serif");
      doc.setFontSize(size);
      doc.setTextColor(0, 0, 0);
      doc.text(text, x, y);
    };
  
    const today = new Date();
    const date = today.toLocaleDateString();
  
    addText("Library Management System", (doc.internal.pageSize.width - doc.getStringUnitWidth("Library Management System") * doc.internal.getFontSize() / doc.internal.scaleFactor) / 2, margin, 20);
    addText(title, margin, margin + 20);
    addText("Date: " + date, doc.internal.pageSize.width - 35, margin + 20, 10);
  
    const startY = Math.max(margin + 16, margin + 16 + doc.getTextDimensions(title).h + 2);
  
    const tableHeaders = customHeaders ? customHeaders : Object.keys(data[0]).map(key => key.toUpperCase());
    const tableData = data.map(row => Object.values(row));
  
    doc.autoTable({
      startY: startY,
      head: [tableHeaders],
      body: tableData,
      margin: { top: startY },
      tableLineColor: [0, 0, 0],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0]
      },
      bodyStyles: {
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      }
    });
  
    doc.save(`${title.replace('IssuedBooks', 'Overdue Books')}.pdf`);
  };

  return (
    <div className="px-5 flex-1">
      <div className="bg-white my-5 px-3 py-2 rounded-xl shadow flex justify-between search-container">
        <div className="flex items-center w-full">
          <BiSearch className="text-3xl mx-2 my-2 sm:text-4xl" />

          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-3 border border-opacity-25 rounded-3xl focus:outline-none focus:ring-1"
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
          <option value="Overdue">Overdue</option>
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
                  <td className={`px-1 py-2 text-center ${book.availability ? "bg-green text-black" : "bg-red text-white"
                    } m-2 inline-block rounded-xl text-sm w-3/4`}>
                    {book.availability ? "Available" : "Not Available"}
                  </td>
                  <td className="px-5">
                    <button className="text-sm text-white bg-blue border p-2 px-4 rounded-lg hover:text-white"  onClick={handleOpenModalIssue}>Issue</button>
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
                    <button onClick={() => handleExport(issuedBooks, 'Book Issued', ["Student Number", "DDC ID", "Book Title", "Issue Date", "Return Date"])} className="bg-gray text-black text-sm p-3 flex items-center rounded-xl hover:bg-blue hover:text-white cursor-pointer">
                    <FaRegFilePdf className="mr-1" />
                    Export as PDF
                    </button>
                  </div>
                </th>
              </tr>

              <tr className="text-left text-black text-lg border-b border-gray">
                <th className="px-5 py-4">Student No.</th>
                <th className="px-5 py-4">DDC ID</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Issue Date</th>
                <th className="px-5 py-4">Return Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {issuedBooks.map((issue, index) => (
                <tr key={index} className="border-b border-gray text-sm">
                  <td className="px-5 py-2">{issue.studentNumber}</td>
                  <td className="px-5 py-2">{issue.docId}</td>
                  <td className="px-5 py-2">{issue.title}</td>
                  <td className="px-5 py-2">{issue.issueDate}</td>
                  <td className="px-5 py-2">{issue.returnDate}</td>
                  <td className="px-5">
                    <button className="text-sm text-blue font-normal py-2 my-2  rounded-lg hover:text-black">Mark as Returned</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTable === 'Overdue' && (
        <div className="admin-table overflow-y-auto rounded-xl custom-scrollbar">
          <table className="bg-white w-full rounded-2xl px-2 py-2 shadow-xl">
            <thead className="sticky top-0 bg-white">
              <tr className="pb-2">
                <th colSpan="10">
                  <div className="flex justify-between items-center px-5 py-4">
                    <h2 className="text-xl text-black">Overdue books</h2>
                    <button onClick={() => handleExport(overdueBooks, 'Overdue Books', ["Student Number", "Name", "DDC ID", "Title", "Status"])} className="bg-gray text-black text-sm p-3 flex items-center rounded-xl hover:bg-blue hover:text-white cursor-pointer">
                    <FaRegFilePdf className="mr-1" />
                    Export as PDF
                    </button>
                  </div>
                </th>
              </tr>
              <tr className="text-left text-black text-lg border-b border-gray">
                <th className="px-5 py-4">Student No.</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">DDC ID</th>
                <th className="px-5 py-4">Book Title</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {overdueBooks &&
                overdueBooks.map((overdue, index) => (
                  <tr key={index} className="border-b border-gray text-sm">
                    <td className="px-5 py-2">{overdue.studentNumber}</td>
                    <td className="px-5 py-2">{overdue.name}</td>
                    <td className="px-5 py-2">{overdue.docId}</td>
                    <td className="px-5 py-2">{overdue.title}</td>
                    <td className="px-5 py-2">{overdue.status}</td>
                    <td className="px-5">
                      <button className="text-sm text-blue font-normal py-2 my-2  rounded-lg hover:text-black">Mark as Returned</button>
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

            <form>
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-sm m-1 font-semibold">
                    Student Number:
                  </label>
                  <input
                    type="text"
                    name="studentNumber"
                    id="studentNumber"
                    placeholder="12345678"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                  />
                </div>

                <div >
                  <label className="text-sm m-1 font-semibold">
                    DDC ID:
                  </label>
                  <input
                    type="text"
                    name="docId"
                    id="docId"
                    placeholder="1234"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                  />
                </div>

                <div >
                  <label className="text-sm m-1 font-semibold">
                    Book Title:
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Superbook"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                  />
                </div>

                <div>
                  <label className="text-sm m-1 font-semibold">
                    Issue Date:
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    id="issueDate"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                  />
                </div>

                <div>
                  <label htmlFor="returnDate" className="text-sm m-1 font-semibold">Return Date:</label>
                  <input
                    type="date"
                    name="returnDate"
                    id="returnDate"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
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
