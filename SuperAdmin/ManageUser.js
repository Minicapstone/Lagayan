import React, { useState, useEffect } from "react";
import { supabase } from '../../utils/supabaseClient';
import { BiSearch } from "react-icons/bi";
import { FaRegFilePdf } from "react-icons/fa";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { IoEyeOutline } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserListSuperAdmin = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleOpenModalUpdate = () => {
    setShowModalUpdate(true);
  };

  const [users, setUsers] = useState([]);


  const [user, setUser] = useState({});
  const [userData, setUserData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from('users')
      .select('*');
    setUsers(data);
  }

  function handleChange(event) {
    setUser((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  }

  function handleUpdate(event) {
    setUserData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  }

  async function addUser() {
    try {
      console.log("Adding user...");
      await supabase
        .from('users')
        .insert([
          {
            student_number: user.studentNumber,
            password: user.password,
            last_name: user.lastName,
            first_name: user.firstName,
            middle_name: user.middleName,
            email: user.email,
            course: user.course,
          },
        ]);

      setShowModal(false);
      console.log("User added successfully.");
      fetchUsers();

      setUser({
        studentNumber: '',
        lastName: '',
        firstName: '',
        middleName: '',
        password: '',
        email: '',
        course: ''
      });

    } catch (error) {
      console.error("Error adding user:", error);
    }
  }

  async function deleteUser(userId) {
    await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    fetchUsers();
  }


  function displayUser(userId) {
    const user = users.find((user) => user.id === userId);
    if (user) {
      setUserData({
        id: user.id,
        studentNumber: user.student_number,
        password: user.password,
        lastName: user.last_name,
        firstName: user.first_name,
        middleName: user.middle_name,
        email: user.email,
        course: user.course
      });
    }
  }

  async function updateUser(userId) {
    try {
      console.log("Updating user...");
      await supabase
        .from('users')
        .update({
          student_number: userData.studentNumber,
          password: userData.password,
          last_name: userData.lastName,
          first_name: userData.firstName,
          middle_name: userData.middleName,
          email: userData.email,
          course: userData.course,
        })
        .eq('id', userId);

      setShowModalUpdate(false);
      console.log("User updated successfully.");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  const [searchQuery, setSearchQuery] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "BSCS", "BSTM", "BSHM", "POLSCI", "BEED", "BSBA"];

  const filteredData = users.filter((user) =>
    selectedCategory === 'All' || user.course === selectedCategory
      ? String(user.student_number).includes(searchQuery) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.middle_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
      : false
  );

  const handleExport = () => {
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
    addText("User List", margin, margin + 20);
    addText("Date: " + date, doc.internal.pageSize.width - 35, margin + 20, 10);

    const startY = Math.max(margin + 16, margin + 16 + doc.getTextDimensions("User List").h + 2);

    const tableHeaders = ["Student No.", "Lastname", "Firstname", "Middlename", "Email", "Course"];
    const tableData = filteredData.map(user => [user.student_number, user.last_name, user.first_name, user.middle_name, user.email, user.course]);

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

    doc.save("UserList.pdf");
};
  return (
    <div className="px-5 flex-1">
      <div className="bg-white my-5 px-2 py-2 rounded-xl shadow flex justify-between search-container">
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
          id="category"
          name="category"
          className="w-fit py-3 px-4 xl:ml-60 md:ml-32 bg-gray rounded-xl shadow-sm focus:outline-none focus:ring-maroon focus:border-maroon sm:text-sm category "
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-table overflow-y-auto rounded-xl custom-scrollbar">
        <table className="bg-white w-full rounded-lg px-2 py-2 shadow-xl">
          <thead className="sticky top-0 bg-white">
            <tr className="pb-2">
              <th colSpan="10">
                <div className="flex justify-between items-center px-5 py-4">
                  <h2 className="text-xl text-black">Users list</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExport}
                      className="bg-gray text-black text-sm p-3 flex items-center rounded-xl hover:bg-blue hover:text-white cursor-pointer">
                      <FaRegFilePdf className="mr-1" />
                      Export as PDF
                    </button>
                    <button
                      className="bg-gray text-black text-sm font-semibold rounded-xl p-3 hover:bg-blue hover:text-white"
                      onClick={handleOpenModal}>
                      Add User
                    </button>
                  </div>
                </div>
              </th>
            </tr>

            <tr className="text-left text-black text-lg border-b border-gray">
              <th className="px-5 py-4">Student No.</th>
              <th className="px-5 py-4">Lastname</th>
              <th className="px-5 py-4">Firstname</th>
              <th className="px-5 py-4">Middlename</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Course</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((user) => (
              <tr key={user.id} className="border-b border-gray text-sm">
                <td className="px-5 py-2">{user.student_number}</td>
                <td className="px-5 py-2">{user.last_name}</td>
                <td className="px-5 py-2">{user.first_name}</td>
                <td className="px-5 py-2">{user.middle_name}</td>
                <td className="px-5 py-2">{user.email}</td>
                <td className="px-5 py-2">{user.course}</td>
                <td className="px-5">
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label='Options'
                      icon={<BsThreeDots style={{ fontSize: '2.5rem', marginLeft: '0.5rem' }} />}
                      variant='outline'
                    />
                    <MenuList className="bg-white shadow rounded-lg p-1" zIndex={10}>
                      <MenuItem>
                        <button className="text-sm text-black w-full p-2 m-2 font-semibold hover:underline"
                          onClick={() => { displayUser(user.id); handleOpenModalUpdate(); }}>Update</button>
                      </MenuItem>
                      <MenuItem>
                        <button className="text-sm text-black w-full p-2 m-2 font-semibold hover:underline"
                          onClick={() => { if (window.confirm("Are you sure you want to delete this user?")) { deleteUser(user.id); } }}>Delete
                        </button>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {showModal && (
        <div className="fixed inset-0 z-10 flex justify-center items-center shadow-2xl bg-black bg-opacity-50" onClick={() => setShowModal(false)}>
          <div className="bg-white p-4 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-center">
              Student Information
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); addUser(user); }}>
              <div className="grid grid-cols-2 gap-10">
                <div className="flex flex-col w-72">
                  <label className="text-sm m-1 font-semibold">Student number:</label>

                  <input
                    type="number"
                    placeholder="Student Number"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="studentNumber"
                    value={user.studentNumber}
                    onChange={handleChange}
                    required
                  />

                  <label className="text-sm m-1 font-semibold">Lastname:</label>
                  <input
                    type="text"
                    placeholder="Lastname"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleChange}
                    required
                  />

                  <label className="text-sm m-1 font-semibold">Firstname:</label>
                  <input
                    type="text"
                    placeholder="Firstname"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleChange}
                    required
                  />

                  <label className="text-sm m-1 font-semibold">Middlename:</label>
                  <input
                    type="text"
                    placeholder="Middlename"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="middleName"
                    value={user.middleName}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col w-72">
                  <label className="text-sm m-1 font-semibold">Password:</label>
                  <div className="relative">
                    <input
                      type={visible ? "text" : "password"}
                      placeholder="Password"
                      className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                      name="password"
                      value={user.password}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute right-0 top-0 mt-4 mr-4 text-xl text-blue" onClick={() => setVisible(!visible)}>
                      {
                        visible ? <IoEyeOutline /> : <AiOutlineEyeInvisible />
                      }
                    </div>
                  </div>
                  <label className="text-sm m-1 font-semibold">Email:</label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    required
                  />

                  <label className="text-sm m-1 font-semibold">Course:</label>
                  <input
                    type="text"
                    placeholder="Course"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="course"
                    value={user.course}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="bg-blue text-white py-2 px-4 rounded-lg mr-2">
                  Create account
                </button>
              </div>
            </form>

          </div>
        </div>
      )}


      {showModalUpdate && (
        <div className="fixed inset-0 z-10 flex justify-center items-center shadow-2xl bg-black bg-opacity-50
        " onClick={() => setShowModalUpdate(false)}>
          <div className="bg-white p-4 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-center">
              Student Information
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); updateUser(userData.id); }}>
              <div className="grid grid-cols-2 gap-10">
                <div className="flex flex-col w-72">
                  <label className="text-sm ml-1">Student number:</label>

                  <input
                    type="number"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="studentNumber"
                    defaultValue={userData.studentNumber}
                    onChange={handleUpdate}
                  />

                  <label className="text-sm ml-1">Lastname:</label>
                  <input
                    type="text"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="lastName"
                    defaultValue={userData.lastName}
                    onChange={handleUpdate}
                  />

                  <label className="text-sm ml-1">Firstname:</label>
                  <input
                    type="text"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="firstName"
                    defaultValue={userData.firstName}
                    onChange={handleUpdate}
                  />

                  <label className="text-sm ml-1">Middlename:</label>
                  <input
                    type="text"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="middleName"
                    defaultValue={userData.middleName}
                    onChange={handleUpdate}
                  />
                </div>

                <div className="flex flex-col w-72">
                  <label className="text-sm ml-1">Password:</label>
                  <div className="relative">
                    <input
                      type={visible ? "text" : "password"}
                      className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                      name="password"
                      defaultValue={userData.password}
                      onChange={handleUpdate}
                    />
                    <div className="absolute right-0 top-0 mt-4 mr-4 text-xl text-maroon" onClick={() => setVisible(!visible)}>
                      {
                        visible ? <IoEyeOutline /> : <AiOutlineEyeInvisible />
                      }
                    </div>
                  </div>

                  <label className="text-sm ml-1">Email:</label>
                  <input
                    type="email"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="email"
                    defaultValue={userData.email}
                    onChange={handleUpdate}
                  />

                  <label className="text-sm ml-1">Course:</label>
                  <input
                    type="text"
                    className="shadow rounded-xl text-sm px-5 py-4 mb-4 w-full"
                    name="course"
                    defaultValue={userData.course}
                    onChange={handleUpdate}
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="bg-blue text-white py-2 px-4 rounded-lg mr-2">
                  Update
                </button>
                <button
                  type="submit"
                  className="bg-red text-white py-2 px-4 rounded-lg mr-2" onClick={() => setShowModalUpdate(false)}>
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserListSuperAdmin;
