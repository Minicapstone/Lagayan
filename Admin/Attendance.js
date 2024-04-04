import React, { useState, useEffect } from 'react';
import { FaRegFilePdf } from "react-icons/fa";
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Attendance = () => {
  // Modals
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => {
    setShowModal(true);
    setStudentNumber('');
  };

  // Para sa form 
  const [studentNumber, setStudentNumber] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');

  // Pang fetch ng table
  const [attendanceData, setAttendanceData] = useState([]);

  // Realtime fetch
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Realtime fetch sa form pag nag type stud no.
  useEffect(() => {
    if (studentNumber) {
      fetchStudentInfo(studentNumber);
    }
  }, [studentNumber]);

  // Tawag ng info na need sa form and dito rin ni set yung pang format ng fullname
  const fetchStudentInfo = async (studentNumber) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, course')
        .eq('student_number', studentNumber)
        .single();

      if (error) {
        throw error;
      }

      // Dito naka set yung fullname and course matik 
      if (data) {
        setName(`${data.first_name} ${data.last_name}`);
        setCourse(data.course);

      } else {
        setName('');
        setCourse('');
      }
    } catch (error) {
      console.error('Error fetching student info:', error.message);
    }
  };

  // Pang fetch ng data sa table
  async function fetchAttendanceData() {
    const { data } = await supabase.from('attendance').select('*');
    setAttendanceData(data);
  }

  // Pang add sa attendance database
  async function handleSignIn(event) {
    event.preventDefault();

    try {
      // Pang format ng time 
      const currentTime = new Date();
      const localTime = new Date(currentTime.getTime() - currentTime.getTimezoneOffset() * 60000);
      const formattedTime = localTime.toISOString().split('T')[1].split('.')[0];

      // Pang check kung may acc kaba
      if (!name || !course) {
        toast.warn('Invalid student number or no account found.', {
          autoClose: 2000,
          hideProgressBar: true
        });
        return;
      }

      // Dito na yung add
      await supabase
        .from('attendance')
        .insert([
          {
            studnum: studentNumber,
            studentname: name,
            course: course,
            time_in: formattedTime,
            time_out: null,
            date: new Date().toISOString().split('T')[0],
          },
        ]);

      // Pang empty ng form  
      setStudentNumber('');
      setName('');
      setCourse('');

      setShowModal(false);
      fetchAttendanceData();

      toast.success("Sign in successfully", {
        autoClose: 2000,
        hideProgressBar: true
      });

    } catch (error) {
      console.error('Error adding:', error.message);
      toast.error("Error adding. Please try again.", {
        autoClose: 2000,
        hideProgressBar: true
      });
    }
  }

  // Para sa sign out button pang update 
  async function handleSignOut(studentNumber) {
    try {
      // Format ng time
      const currentTime = new Date();
      const localTime = new Date(currentTime.getTime() - currentTime.getTimezoneOffset() * 60000);
      const formattedTime = localTime.toISOString().split('T')[1].split('.')[0];

      // Update ng signout
      await supabase
        .from('attendance')
        .update({ time_out: formattedTime })
        .eq('studnum', studentNumber);

      fetchAttendanceData();

      toast.success("Signed out", {
        autoClose: 2000,
        hideProgressBar: true
      });

    } catch (error) {
      console.error('Error signing out:', error.message);
      toast.error("Error signing out. Please try again.", {
        autoClose: 2000,
        hideProgressBar: true
      });
    }
  }

  // Handle date change
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const handleDateChange = (date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const filteredData = attendanceData.filter((item) => item.date === selectedDate);

  // Export as PDF
  const handleExport = () => {
    const doc = new jsPDF();
    const margin = 16;

    const addText = (text, x, y, size = 12) => {
      doc.setFont("Poppins", "sans-serif");
      doc.setFontSize(size);
      doc.setTextColor(0, 0, 0);
      doc.text(text, x, y);
    };

    const currentDate = new Date(selectedDate).toLocaleDateString();

    addText("Library Management System", (doc.internal.pageSize.width - doc.getStringUnitWidth("Library Management System") * doc.internal.getFontSize() / doc.internal.scaleFactor) / 2, margin, 20);
    addText("Library Log", margin, margin + 20);
    addText("Date: " + currentDate, doc.internal.pageSize.width - 35, margin + 20, 10);

    const startY = Math.max(margin + 16, margin + 16 + doc.getTextDimensions("Library Log").h + 2);

    const tableHeaders = ["Student No.", "Name", "Course", "Date", "Time In", "Time Out"];
    const tableData = filteredData.map(user => [
      user.studnum,
      user.studentname,
      user.course,
      user.date,
      user.time_in ? new Date(`2000-01-01T${user.time_in}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--: -- : -- :--',
      user.time_out ? new Date(`2000-01-01T${user.time_out}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--: -- : -- :--'
    ]);

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

    doc.save("LibraryLog.pdf");
  };

  return (
    <div className='px-5 my-5 flex-1'>
      <div className="admin-table overflow-y-auto rounded-xl custom-scrollbar">
        <table className='bg-white w-full rounded-2xl px-2 py-2 shadow-xl'>
          <thead className='sticky top-0 bg-white'>
            <tr className='pb-2'>
              <th colSpan='10'>
                <div className='flex justify-between items-center px-5 py-4'>
                  <h2 className='text-xl text-black'>Library Log</h2>
                  <div className="flex items-center gap-3">
                    <DatePicker
                      selected={new Date(selectedDate)}
                      onChange={handleDateChange}
                      dateFormat="MM/dd/yyyy"
                    />
                    <button
                      onClick={handleExport}
                      className="bg-gray text-black text-sm p-3 flex items-center rounded-xl hover:bg-blue hover:text-white cursor-pointer">
                      <FaRegFilePdf className="mr-1" />
                      Export as PDF
                    </button>
                    <button
                      className="bg-gray text-black text-sm font-semibold rounded-xl p-3 hover:bg-blue hover:text-white"
                      onClick={handleOpenModal}>
                      Sign in
                    </button>
                  </div>
                </div>
              </th>
            </tr>

            <tr className='text-left text-black text-lg border-b border-gray'>
              <th className='px-5 py-4 w-1/6'>Student No.</th>
              <th className='px-5 py-4 w-1/6'>Name</th>
              <th className="px-5 py-4 w-1/6">Course</th>
              <th className="px-5 py-4 w-1/6">Date</th>
              <th className="px-5 py-4 ">Time In</th>
              <th className="px-5 py-4 ">Time Out</th>
              <th className="px-5 py-4 ">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.sort((a, b) => new Date(a.date) - new Date(b.date)).map((item) => (
              <tr key={item.id} className='border-b border-gray text-sm'>
                <td className='px-5 py-2'>{item.studnum}</td>
                <td className='px-5 py-2'>{item.studentname}</td>
                <td className="px-5 py-2">{item.course}</td>
                <td className="px-5 py-2">{item.date}</td>
                <td className="px-5 py-2">
                  {new Date(`2000-01-01T${item.time_in}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>

                <td className="px-5 py-2">
                  {item.time_out ?
                    new Date(`2000-01-01T${item.time_out}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    :
                    '--: -- : -- :--'}
                </td>

                <td className="px-5 py-2">
                  {!item.time_out ? (
                    <button
                      onClick={() => handleSignOut(item.studnum)}
                      className="text-red px-3 py-1 rounded-md inline">
                      Sign out
                    </button>
                  ) : (
                    <span className="text-green">Signed out</span>
                  )}
                  {/* <button
                    onClick={() => handleDeleteAttendance(item.id)}
                    className="bg-red ml-4 text-white px-3 py-1 rounded-md">
                    Delete
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 flex justify-center items-center shadow-2xl bg-black bg-opacity-50" onClick={() => setShowModal(false)}>
          <div className="bg-white p-12 rounded-lg shadow" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-8 text-center">
              Student Information
            </h2>

            <form onSubmit={handleSignIn}>
              <div className="flex flex-col w-96">
                <label className="text-base font-semibold m-1">Student number</label>
                <input
                  type="number"
                  placeholder="Student Number"
                  className="shadow rounded-xl text-sm px-3 py-3 mb-3 input-border w-full"
                  value={studentNumber}
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length !== studentNumber.length) {
                      setName('');
                      setCourse('');
                    }
                    setStudentNumber(value);
                  }}
                />

                <label className="text-base font-semibold m-1 ">Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  className="shadow rounded-xl text-sm px-3 py-3 mb-3 input-border w-full"
                  value={name}
                  readOnly
                />

                <label className="text-base font-semibold m-1">Course</label>
                <input
                  type="text"
                  placeholder="Course"
                  className="shadow rounded-xl text-sm px-3 py-3 mb-3 input-border w-full"
                  value={course}
                  readOnly
                />
              </div>

              <div className="flex justify-center pt-4">
                <button type='submit' className="bg-blue text-white py-2 px-4 rounded-lg mr-2">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Attendance;