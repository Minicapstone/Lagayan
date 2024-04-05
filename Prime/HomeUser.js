import React, { useState, useEffect } from "react";
import { supabase } from '../../utils/supabaseClient';
import Books from "./Books";

const UserDashboard = ({ userFirstName, userStudentNumber }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalID);
  }, []);

  const hour = currentTime.getHours();
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getGreeting = () => {
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('borrowbooks')
          .select('ddc_no, book_title, issue_date, return_date')
          .eq('student_no', userStudentNumber);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setTransactions(data);
        } else {
          setTransactions([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error.message);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userStudentNumber]);


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
              <li className="text-base ml-5 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
              <li className="text-base ml-5 mt-3 text-black bg-white rounded-lg px-2 py-6 shadow">
                <p>This is a Notification</p>
              </li>
            </ul>
          </div>
        </div>

       {/* Right side */}
       <div className="mr-5 ml-12 mt-5 relative bg-white rounded-lg p-4 shadow">
          <div className="flex flex-col">
            <p className="text-lg">Transaction History</p>
            <div className="transaction-list overflow-auto h-full">
              {loading ? (
                <p className="text-black text-center py-72">Loading...</p> 
              ) : transactions.length === 0 ? (
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