import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { postTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
  const [tablesError, setTablesError] = useState(null);
  const history = useHistory();

  const initialFormState = {
    table_name: "",
    capacity: "",
    reservation_id: null,
  };

  const [formData, setFormData] = useState({ ...initialFormState });

  const handleNameChange = ({ target }) => {
    let name = target.name;
    let value = target.value;

    if (name === "table_name") {
        if (value.length < 2) {
            setTablesError(new Error("Table Name must be at least 2 characters long."));
        } else {
            setTablesError(null);
        }
    }

    if (name === "capacity") {
        if (isNaN(value)) {
          setTablesError(new Error("Capacity must be a number."));
        } else if (value < 1) {
          setTablesError(new Error("Capacity must be at least 1."));
        } else {
          setTablesError(null);
        }
    }
    setFormData({
        ...formData,
        [target.name]: target.value,
    });
  }

  const handleCapacityChange = (event) => {
      const changeObj = { ...formData };
      changeObj[event.target.id] = event.target.value;
      changeObj.capacity = Number(changeObj.capacity);
      setFormData(changeObj);
  };
  

  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();

    setTablesError(null);

    postTable(formData, abortController.signal)
      .then(() => history.push(`/dashboard`))
      .catch(setTablesError);
    return () => abortController.abort();
  };

  return (
    <div>
      <h2>New Table</h2>
      <form name="table" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="table_name">Table Name</label>
          <input
            id="table_name"
            type="text"
            name="table_name"
            onChange={handleNameChange}
            value={formData.table_name}
            placeholder="Table Name"
            className="form-control"
            required
          ></input>
          <label htmlFor="capacity">Capacity</label>
          <input
            id="capacity"
            name="capacity"
            onChange={handleCapacityChange}
            value={formData.capacity}
            type="number"
            className="form-control"
            placeholder="1"
            min="1"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mr-1">
          Submit
        </button>
        <button onClick={() => history.goBack()} className="btn btn-danger">
          Cancel
        </button>
      </form>
    {tablesError ? <ErrorAlert error={tablesError} /> : null} 
    </div>
  );
}

export default NewTable;