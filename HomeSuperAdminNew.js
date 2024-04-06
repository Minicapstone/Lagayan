import React, { useState, useEffect } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import Greetings from "./Greetings";
import { supabase } from '../../utils/supabaseClient';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const SA_Dashboard = () => {

  const options = {
    height: 400,
    axisY: {
      maximum: 30,
    },

    data: [
      {
        type: "column",
        dataPoints: [
          { label: "Monday", y: 10, color: "#59adff" },
          { label: "Tuesday", y: 15, color: "#59adff" },
          { label: "Wednesday", y: 15, color: "#59adff" },
          { label: "Thursday", y: 10, color: "#59adff" },
          { label: "Friday", y: 10, color: "#59adff" },
          { label: "Saturday", y: 3, color: "#59adff" },
        ],
      },
    ],
  };

  

  const [totalUsers, setTotalUsers] = useState([]);

  useEffect(() => {
    fetchTotalUsers();
    const intervalId = setInterval(fetchTotalUsers, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []); 

  const fetchTotalUsers = async () => {
    try {
      const { data: total, error } = await supabase.from('users').select('*');
      if (error) {
        throw error;
      }
      setTotalUsers(total);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  

  const [totalunavailable, setTotalUnavailble] = useState(0); // Initialize totalAvailableBooks as a number

  useEffect(() => {
    fetchTotalUnavailableBooks();
    const intervalId = setInterval(fetchTotalUnavailableBooks, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []); 

  const fetchTotalUnavailableBooks = async () => {
    try {
      const { data: notavailableBooks, error } = await supabase
        .from('books')
        .select('*')
        .eq('availability', 'FALSE'); // Fetch records where availability is 'TRUE'
  
      if (error) {
        throw error;
      }
  
      setTotalUnavailble(notavailableBooks.length); // Set totalAvailableBooks to the count of available books
    } catch (error) {
      console.error('Error fetching available books:', error.message);
    }
  };

  const [overdueBooks, setOverdueBooks] = useState(0); // Initialize overdueBooks as a number

  useEffect(() => {
    fetchOverdueBooks();
    const intervalId = setInterval(fetchOverdueBooks, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []); 

  const fetchOverdueBooks = async () => {
    try {
      const { data: overdue, error } = await supabase
        .from('borrowbooks')
        .select('*')
        .eq('status', 'Overdue'); 
  
      if (error) {
        throw error;
      }
  
      setOverdueBooks(overdue.length); // Set overdueBooks to the count of overdue books
    } catch (error) {
      console.error('Error fetching overdue books:', error.message);
    }
  };

  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [topPickedBook, setTopPickedBook] = useState(null);

  useEffect(() => {
    // Function to fetch borrowed books data from Supabase
    const fetchBorrowedBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('borrowbooks')
          .select('book_title');

        if (error) {
          throw error;
        }

        setBorrowedBooks(data);
      } catch (error) {
        console.error('Error fetching borrowed books:', error.message);
      }
    };

    fetchBorrowedBooks();
  }, []);

  useEffect(() => {
    // Function to count occurrences of each book and find the top picked book
    const countBooks = () => {
      const bookCounts = {};

      borrowedBooks.forEach(book => {
        const { book_title } = book;
        if (bookCounts[book_title]) {
          bookCounts[book_title]++;
        } else {
          bookCounts[book_title] = 1;
        }
      });

      // Sort books by count in descending order
      const sortedBooks = Object.entries(bookCounts)
        .sort((a, b) => b[1] - a[1]);

      // Set the top picked book
      if (sortedBooks.length > 0) {
        const [topBookId, ] = sortedBooks[0];
        // Here you can fetch the book details from another table based on book_id if needed
        setTopPickedBook(topBookId);
      }
    };

    countBooks();
  }, [borrowedBooks]);

    const [borrowedBookss, setBorrowedBookss] = useState([]);
    const [topStudents, setTopStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      // Function to fetch borrowed books data from Supabase
      const fetchBorrowedBooks = async () => {
        try {
          const { data, error } = await supabase
            .from('borrowbooks')
            .select('full_name'); // Change 'student_name' to your actual column name containing student names
  
          if (error) {
            throw error;
          }
  
          setBorrowedBookss(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching borrowed books:', error.message);
          setError(error.message);
          setLoading(false);
        }
      };
  
      fetchBorrowedBooks();
    }, []);
  
    useEffect(() => {
      // Function to count occurrences of each student and find the top students
      const countStudents = () => {
        const studentCounts = {};
  
        borrowedBookss.forEach(book => {
          const { full_name } = book;
          if (studentCounts[full_name]) {
            studentCounts[full_name]++;
          } else {
            studentCounts[full_name] = 1;
          }
        });
  
        // Sort students by count in descending order
        const sortedStudents = Object.entries(studentCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5); // Select the top 5 students
  
        setTopStudents(sortedStudents);
      };
  
      countStudents();
    }, [borrowedBookss]);
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (error) {
      return <div>Error: {error}</div>;
    }
  


  
      
  return (
    <div className="statistics-section flex-1">
      <Greetings></Greetings>
      <div className="flex justify-between mt-10 mb-8 gap-5">
        <div className="p-12 h-60 w-full bg-white mx-5 rounded-xl shadow">
          <p className="text-4xl text-center mt-5 font-bold">{totalUsers.length}</p>
          <p className="center text-lg font-bold text-center my-3">Total Users</p>
        </div>

        <div className="p-12 h-60 w-full bg-white mr-5 rounded-xl shadow">
      <p className="text-xl text-blue text-center mt-5 font-bold">{topPickedBook}</p>
      <p className="center text-lg font-bold text-center my-3">
        Top Picked Book
      </p>
    </div>

        <div className="p-12 h-60 w-full bg-white mr-5 rounded-xl shadow">
          <p className="text-4xl text-center mt-5 font-bold">{totalunavailable}</p>
          <p className="center text-lg font-bold text-center my-3">
            Currently Issued Books
          </p>
        </div>

        <div className="p-12 h-60 w-full bg-white mr-5 rounded-xl shadow">
          <p className="text-4xl text-center mt-5 font-bold">{overdueBooks}</p>
          <p className="center text-lg font-bold text-center my-3">
            Overdue Books
          </p>
        </div>
      </div>

      <div className="flex">
        <div className="h-auto w-full bg-white mx-5 p-5 mt-5 rounded-xl shadow">
          <p className="center text-lg font-bold text-center my-3">
            New Users per Day
          </p>
          <CanvasJSChart
            options={options}
          /* onRef={ref => this.chart = ref} */
          />
        </div>

        <div className="bg-white mx-5 w-1/2 mt-5 rounded-xl shadow flex flex-col">
          <p className="text-xl font-bold text-center mt-10">Top Borrower</p>
          <div className="p-10">
        {topStudents.map(([student, count], index) => (
          <p key={index} className="mt-5 p-3 w-full bg-gray rounded-md text-black flex justify-between">
            {`${index + 1}. ${student}`} <span>{`${count}`}</span>
          </p>
        ))}
      </div>

        </div>
      </div>
    </div>
  );
};


export default SA_Dashboard;
