import React, { useState, useEffect } from "react";
import { supabase } from '../../utils/supabaseClient';
import { FiAlertTriangle } from 'react-icons/fi'; 
import Books from "./Books";

const UserDashboard = ({ userFirstName, userStudentNumber }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [overdueTransactions, setOverdueTransactions] = useState([]);
  const [newBooksAdded, setNewBooksAdded] = useState([]);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('borrowbooks')
          .select('ddc_no, book_title, issue_date, return_date, status')
          .eq('student_no', userStudentNumber);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setTransactions(data);
          const overdue = data.filter(transaction => transaction.status === 'Overdue');
          setOverdueTransactions(overdue);
        } else {
          setTransactions([]);
          setOverdueTransactions([]);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error.message);
      }
    };

    const fetchNewBooks = async () => {
      try {
        const { data: booksData, error: booksError } = await supabase
          .from('books')
          .select('id, title, created, author');

        if (booksError) {
          throw booksError;
        }

        if (booksData && booksData.length > 0) {
          const newBooks = booksData.filter(book => {
            const createdDate = new Date(book.created);
            const currentDate = new Date();
            const timeDiff = Math.abs(currentDate.getTime() - createdDate.getTime());
            const diffHours = Math.ceil(timeDiff / (1000 * 3600));
            return diffHours <= 24; // Only return books created within the last 24 hours
          });
          setNewBooksAdded(newBooks);
        } else {
          setNewBooksAdded([]);
        }
      } catch (error) {
        console.error('Error fetching new books:', error.message);
      }
    };

    fetchTransactions();
    fetchNewBooks();

    return () => clearInterval(intervalID);
  }, [userStudentNumber, currentTime]);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  return (
    <div className="h-screen flex-1">
      <div className="p-4 m-5 bg-white rounded-lg shadow">
        <div className="flex justify-between">
          <div className="Greetings">
            <p className="text-xl font-semibold pr-4">
              {getGreeting()}, <span className="text-blue">Welcome {userFirstName}!👋</span>
            </p>
          </div>
          <div>
            <p className="text-xl font-semibold">
              {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} |{' '}
              {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}, {formattedTime}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Left side */}
        <div className="flex flex-col">
          <Books />
          <div className="flex flex-col my-3">
            <h1 className="ml-5 my-5 text-left text-xl font-bold">
              Notifications
            </h1>
            <ul className="custom-scrollbar overflow-y-auto notification-height">
              {overdueTransactions.map((transaction, index) => (
                <li key={index} className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                  <div className="flex items-center">
                    <FiAlertTriangle className="text-red mr-3" /> 
                    <p><b><u>{transaction.book_title}</u></b> is overdue! Return the book as soon as possible. It was due on {new Date(transaction.return_date).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
              {newBooksAdded.length > 0 && (
                newBooksAdded.map((book, index) => (
                  <li key={index} className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                    <div className="flex items-center">
                      <FiAlertTriangle className="text-green mr-3" /> 
                      <p><b><u>{book.title}</u></b> by {book.author} is added in the last 24 hours</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

       {/* Right side */}
       <div className="mr-5 ml-12 mt-5 relative bg-white rounded-lg p-4 shadow">
          <div className="flex flex-col">
            <p className="text-lg">Transaction History</p>
            <div className="transaction-list overflow-auto h-full">
              {transactions.length === 0 ? (
                <p className="text-black text-center py-72">No transactions made yet.</p>
              ) : (
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left text-black text-base border-b border-gray">
                      <th className="px-5 py-4">Book Title</th>
                      <th className="px-5 py-4">DDC No</th>
                      <th className="px-5 py-4">Issue Date</th>
                      <th className="px-5 py-4">Return Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-gray text-sm">
                        <td className="px-5 py-2">{transaction.book_title}</td>
                        <td className="px-5 py-2">{transaction.ddc_no}</td>
                        <td className="px-5 py-2">{new Date(transaction.issue_date).toLocaleDateString()}</td>
                        <td className="px-5 py-2">{transaction.return_date ? new Date(transaction.return_date).toLocaleDateString() : 'Not returned yet'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
