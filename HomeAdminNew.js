import React, { useState, useEffect } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import { supabase } from '../../utils/supabaseClient';

const HomeAdmin = () => {

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

  const [username] = useState("Admin");

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hour = currentTime.getHours();

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getGreeting = () => {
    if (hour >= 5 && hour < 12) {
      return "Good morning";
    } else if (hour >= 12 && hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  var CanvasJSChart = CanvasJSReact.CanvasJSChart;

  const [totalIssuedToday, setTotalIssuedToday] = useState(0); // Initialize totalIssued as a number

  useEffect(() => {
    fetchTotalIssuedToday();
    const intervalId = setInterval(fetchTotalIssuedToday, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const fetchTotalIssuedToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const { data: totalIssuedBooksToday, error } = await supabase
        .from('borrowbooks')
        .select('*')
        .eq('issue_date', today); // Fetch records where borrow_date is today

      if (error) {
        throw error;
      }

      setTotalIssuedToday(totalIssuedBooksToday.length); // Set totalIssued to the count of issued books for today
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  //Total Available Books

  const [totalAvailable, setTotalavailble] = useState(0); // Initialize totalAvailableBooks as a number

  useEffect(() => {
    fetchTotalavailableBooks();
    const intervalId = setInterval(fetchTotalavailableBooks, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const fetchTotalavailableBooks = async () => {
    try {
      const { data: notavailableBooks, error } = await supabase
        .from('books')
        .select('*')
        .eq('availability', 'TRUE'); // Fetch records where availability is 'TRUE'

      if (error) {
        throw error;
      }

      setTotalavailble(notavailableBooks.length); // Set totalAvailableBooks to the count of available books
    } catch (error) {
      console.error('Error fetching available books:', error.message);
    }
  };

  //walk ins

  const [totalWalkInsToday, setTotalWalkInsToday] = useState(0); // Initialize totalWalkInsToday as a number

  useEffect(() => {
    fetchTotalWalkInsToday();
    const intervalId = setInterval(fetchTotalWalkInsToday, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const fetchTotalWalkInsToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const { data: walkInsToday, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today); // Fetch records where date is today

      if (error) {
        throw error;
      }

      setTotalWalkInsToday(walkInsToday.length); // Set totalWalkInsToday to the count of walk-ins for today
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  //new users

  const [newestUsers, setNewestUsers] = useState([]); // Initialize newestUsers as an array

  useEffect(() => {
    fetchNewestUsers();
    const intervalId = setInterval(fetchNewestUsers, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const fetchNewestUsers = async () => {
    try {
      const { data: newestUsersData, error } = await supabase
        .from('users')
        .select('last_name, first_name, middle_name')
        .order('timestamp', { ascending: false })
        .range(0, 9);


      if (error) {
        throw error;
      }

      setNewestUsers(newestUsersData);
    } catch (error) {
      console.error('Error fetching newest users:', error.message);
    }
  };

  //Returned Today

 
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


  return (
    <div className="flex-1">
      <div className="p-4 m-5 bg-white rounded-lg shadow mb-3">
        <div className="flex justify-between">
          <div className="Greetings">
            <p className="text-xl font-semibold pr-4">
              {getGreeting()},{" "}
              <span className="text-blue">Welcome {username}!👋</span>
            </p>
          </div>
          <div>
            <p className="text-xl font-semibold">
              {currentTime.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              |{" "}
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
              })}
              , {formattedTime}
            </p>
          </div>
        </div>
      </div>

      <div className="statistics-section flex-1">

        <div className="flex justify-between mt-10 mb-8 gap-5">
          <div className="p-12 h-60 w-full bg-white mx-5 rounded-xl shadow">
            <p className="text-4xl text-center mt-5 font-bold">{totalWalkInsToday}</p>
            <p className="center text-lg font-bold text-center my-3">Walk-Ins Today</p>
          </div>

          <div className="p-12 h-60 w-full bg-white mr-5 rounded-xl shadow">
            <p className="text-4xl text-center mt-5 font-bold">{totalIssuedToday}</p>
            <p className="center text-lg font-bold text-center my-3">
              Books Borrowed Today
            </p>
          </div>

          <div className="p-12 h-60 w-full bg-white mr-5 rounded-xl shadow">
            <p className="text-4xl text-center mt-5 font-bold">{totalAvailable}</p>
            <p className="center text-lg font-bold text-center my-3">
              Total Available Books
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

            />
          </div>

          <div className="bg-white mx-5 w-1/2 mt-5 rounded-xl shadow flex flex-col">
            <p className="text-xl font-bold text-center mt-10">Newly Registered Users</p>
            <div className="p-5 custom-scrollbar overflow-y-auto max-h-[400px]">
              <ul>


                {newestUsers.map((user, index) => (
                  <li className="mt-5 p-3 w-full bg-gray rounded-md text-black flex justify-between" key={index}>
                    {user.last_name}, {user.first_name} {user.middle_name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomeAdmin;
