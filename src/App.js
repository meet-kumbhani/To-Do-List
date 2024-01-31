import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/dist/sweetalert2.min.css';
import moment from 'moment';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import AddIcon from '@mui/icons-material/Add';
import ClearAllIcon from '@mui/icons-material/ClearAll';

function App() {
  const [inputdata, setinputdata] = useState("");
  const [listitem, setlistitem] = useState([]);
  const [editindex, seteditindex] = useState(null);
  const [editvalue, seteditvalue] = useState("");
  const [filteritems, setfilteritems] = useState("all");
  const [itemStates, setItemStates] = useState([]);


  //Add items

  function additems() {
    if (inputdata === "") {
      alert("Enter Something")
    }
    else {
      setlistitem([...listitem, inputdata]);
      setItemStates([...itemStates, { inputdata, runtime: false, pendingcolor: "red", oncolor: "", donecolor: "", strike: "", seconds: 0, opacity: "", starttime: "", endtime: "" }]);
      setinputdata("");
    }

  };

  // Save item in LS

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify([...itemStates, { inputdata, runtime: false, pendingcolor: "red", oncolor: "", donecolor: "", strike: "", seconds: 0, opacity: "", starttime: "", endtime: "" }]))
  }, []);

  // Get Data From LS

  useEffect(() => {
    let storedItems = JSON.parse(localStorage.getItem("items")) || [];
    setlistitem(storedItems.map(item => item.inputdata));
    setItemStates(storedItems);
  }, []);


  // Filter

  let filter = (status) => {
    setfilteritems(status);
  };


  // Clear All items

  function clearall() {
    setlistitem([])
    localStorage.clear()
  }


  // Delete items

  function deleteitems(id) {

    let swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        let deleteitem = listitem.filter((element, index) => {
          return index !== id;
        });
        localStorage.setItem("items", JSON.stringify(deleteitem))
        setlistitem(deleteitem);
        setItemStates((prevStates) => {
          let deleteitems = prevStates.filter((_, index) => index !== id);
          return deleteitems;
        });

        swalWithBootstrapButtons.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success"
        });
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your imaginary file is safe :)",
          icon: "error"
        });
      }
    });

  }


  //Edit Value

  function editItem(index) {
    seteditindex(index);
    seteditvalue(listitem[index]);
  }


  function saveEdit(index) {
    Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`
    }).then((result) => {
      if (result.isConfirmed) {
        let newstate = [...itemStates];
        newstate[index] = {
          ...newstate[index],
          inputdata: editvalue,
        };
        localStorage.setItem("items", JSON.stringify(newstate))
        setItemStates(newstate);

        let newList = [...listitem];
        newList[index] = editvalue;
        setlistitem(newList);
        seteditindex(null);
        seteditvalue("");
        Swal.fire("Saved!", "", "success");
      } else if (result.isDenied) {
        seteditindex(null);
        seteditvalue("");
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  }

  // Timer

  useEffect(() => {
    let timers = [];

    listitem.forEach((item, index) => {
      if (itemStates[index].runtime) {
        timers[index] = setInterval(() => {
          setItemStates((prevStates) => {
            let newstate = [...prevStates];
            newstate[index] = {
              ...newstate[index],
              seconds: newstate[index].seconds + 1,
            };
            return newstate;
          });
        }, 1000);
      }
      localStorage.setItem("items", JSON.stringify(itemStates))
    });

    return () => {
      timers.forEach((timer) => clearInterval(timer));
    };
  }, [itemStates]);

  function start(index) {
    setItemStates((prevStates) => {
      let newstate = [...prevStates];
      newstate[index] = {
        ...newstate[index],
        runtime: true,
        strike: "",
        pendingcolor: "",
        oncolor: "orange",
        donecolor: "",
        opacity: "",
        starttime: moment().format('h:mm:ss A')
      };
      return newstate;
    });
  }

  function stop(index) {
    setItemStates((prevStates) => {
      let newstate = [...prevStates];
      newstate[index] = {
        ...newstate[index],
        runtime: false,
        strike: "line-through",
        pendingcolor: "",
        oncolor: "",
        donecolor: "green",
        opacity: 0.6,
        endtime: moment().format('h:mm:ss A')
      };
      return newstate;
    });
  }

  function resettimer(index) {
    setItemStates((prevStates) => {
      let newstate = [...prevStates];
      newstate[index] = {
        ...newstate[index],
        pendingcolor: "red",
        strike: "",
        oncolor: "",
        donecolor: "",
        seconds: 0,
        runtime: false,
        opacity: ""
      };
      return newstate;
    });
  }

  let format = (second) => {
    let hours = Math.floor(second / 3600);
    let minutes = Math.floor((second % 3600) / 60);
    let seconds = second % 60;

    let time = (num) => (num < 10 ? `0${num}` : num);

    return `${time(hours)}:${time(minutes)}:${time(seconds)}`;
  };

  return (
    <>
      <center>
        <div className="container-fluid">
          <h1 className="mt-4 mb-4 text-white mt-5 display-2">To-Do List</h1>

          <div className="tri-state-toggle mb-3">

            <input
              type="button"
              className={`tri-state-toggle-button ${filteritems === "all" ? "active" : ""}`}
              onClick={() => filter("all")}
              id="allitems"
              value="All Task"
            />


            <input
              type="button"
              className={`tri-state-toggle-button ${filteritems === "pending" ? "active" : ""}`}
              onClick={() => filter("pending")}
              id="pendingbtn"
              value="Pending"
            />

            <input
              type="button"
              className={`tri-state-toggle-button ${filteritems === "complete" ? "active" : ""}`}
              onClick={() => filter("complete")}
              id="completebtn"
              value="Complete"
            />
          </div>

          <div className="card text-white maindiv">

            <div className="d-flex justify-content-center mt-4 m-3">

              <TextField defaultValue="Small" size='small' id="outlined-basic inputtext" label="Enter Something" variant="outlined" type="text" className="form-control" placeholder="" value={inputdata} onChange={(e) => setinputdata(e.target.value)} />

              <Button variant="outlined" className="ms-3" id="addbutton" onClick={additems}>Add <AddIcon /></Button>
            </div>

            {listitem.map((element, index) => {
              let filter =
                (filteritems === "all") ||
                (filteritems === "pending" && itemStates[index].strike === "") ||
                (filteritems === "complete" && itemStates[index].strike !== "");
              return filter ? (
                <div key={index} className='container d-flex justify-content-between align-items-baseline'>
                  {editindex === index ? (
                    <>
                      <input
                        type="text"
                        className="form-control"
                        value={editvalue}
                        onChange={(e) => seteditvalue(e.target.value)}
                        style={{ width: "50%" }} />
                      <Button
                        size='small'
                        variant="contained" color='success'
                        className='btn-sm ms-2 mb-3'
                        onClick={() => saveEdit(index)}
                      >
                        Save <SaveAltIcon />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="three-state-toggle mb-3 me-2">
                        <input
                          style={{ backgroundColor: itemStates[index].pendingcolor }}
                          type="button"
                          className="toggle-buttton pending-btn"
                          value="Pending"
                          onClick={() => resettimer(index)}
                          id="pending"
                        />
                        <input
                          style={{ backgroundColor: itemStates[index].oncolor }}
                          type="button"
                          className="toggle-buttton ongoing-btn"
                          value="On"
                          onClick={() => start(index)}
                          id="ongoing"
                        />
                        <input
                          style={{ backgroundColor: itemStates[index].donecolor }}
                          type="button"
                          className="toggle-buttton completebutton-btn"
                          value="Done"
                          onClick={() => stop(index)}
                          id="done"
                        />
                      </div>

                      <h4 className='ms-1' id="todo-item" style={{ textDecoration: itemStates[index].strike, opacity: itemStates[index].opacity }}>
                        {element}
                      </h4>
                      <span id="stop-watch" className="ms-auto">
                        {format(itemStates[index].seconds)}
                      </span>
                      <Button variant="contained" color='success' size='small' className='ms-auto' onClick={() => editItem(index)}>
                        Edit <EditIcon />
                      </Button>
                    </>
                  )
                  }
                  <Button variant="contained" color='error' size='small' className='ms-2' onClick={() => deleteitems(index)}>
                    Delete <DeleteIcon />
                  </Button>
                </div>

              ) : null
            })}

            <div className="justify-content-center">

              <Button variant="contained" id="clearall" onClick={clearall} color='success'>Clear All <ClearAllIcon /></Button>
            </div>
          </div>

        </div >

      </center >
    </>
  );
}

export default App;