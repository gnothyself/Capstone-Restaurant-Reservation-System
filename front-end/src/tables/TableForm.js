// import React, { useState } from "react";
// import { useHistory } from "react-router-dom";
// import { postTable } from "../utils/api";
// import ErrorAlert from "../layout/ErrorAlert";

// export default function TableForm() {

//     const initialFormState = {
//         table_name: "",
//         capacity: "",
//     }

//     const [form, setForm] = useState({...initialFormState});
//     const [reservationsError, setReservationsError] = useState([]);

//     const history = useHistory();

//     const abortController = new AbortController();

//     const handleChange = ({ target }) => {
//         let name = target.name;
//         let value = target.value;

//         // table_name must be at least 2 characters long
//         if (name === "table_name") {
//             if (value.length < 2) {
//                 setReservationsError(["Table Name must be at least 2 characters long."]);
//             } else {
//                 setReservationsError([]);
//             }
//         }

//         // capacity must be a number greater than 0
//         if (name === "capacity") {
//             if (isNaN(value)) {
//                 setReservationsError(["Capacity must be a number."]);
//             } else if (value < 1) {
//                 setReservationsError(["Capacity must be at least 1."]);
//             } else {
//                 setReservationsError([]);
//             }
//         }
//         // set the form state
//         setForm({
//             ...form,
//             [target.name]: target.value,
//         });
//     }

//     const handleSubmit = (event) => {
//         event.preventDefault();
//         // POST request
//         async function postData() {
//             try {
//                 await postTable(form, abortController.signal);
//                 history.push(`/dashboard`);
//             } catch (error) {
//                 setReservationsError([...reservationsError, error.message]);
//             }
//         }
//         // do not send POST request if there is a pending error message
//         if (reservationsError.length === 0) {
//             postData();
//         }
//     }

//     return (
//         <>
//         <ErrorAlert error={reservationsError} />
//         <form onSubmit={handleSubmit}>
//             <div className="form-group">
//                 <label htmlFor="table_name">Table Name</label>
//                 <input 
//                     className="form-control"
//                     type="text"
//                     name="table_name"
//                     id="table_name"
//                     onChange={handleChange}
//                     required="required"
//                     value={form.table_name}
//                 />
//             </div>
//             <div className="form-group">
//                 <label htmlFor="capacity">Table Capacity</label>
//                 <input 
//                     className="form-control"
//                     type="number"
//                     name="capacity"
//                     id="capacity"
//                     onChange={handleChange}
//                     required="required"
//                     value={form.capacity}
//                 />
//             </div>
//             <button className="btn btn-dark" type="submit">Submit</button>
//             <button className="btn btn-dark mx-3" type="button" onClick={() => history.goBack()}>Cancel</button>
//         </form>
//     </>
//     );
// }

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { postTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * A controlled form used for creating a new table
 */

function NewTable() {
  const [tablesError, setTablesError] = useState(null);
  const history = useHistory();

  const initialFormState = {
    table_name: "",
    capacity: "",
  };

  const [formData, setFormData] = useState({ ...initialFormState });

  const handleChange = ({ target }) => {
    let value = target.value;

    // Fixes issue of *capacity* changing into a string
    if (target.name === "capacity" && typeof value === "string") {
      value = +value;
    }

    setFormData({
      ...formData,
      [target.name]: value,
    });
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

  const handleCancel = (event) => {
    event.preventDefault();
    // cancelling a new table while in progress sends user back to previous page.
    history.goBack();
  };

  return (
    <section>
      <div className="d-md-flex mb-3 text-center">
        <h1 className="mb-0">New Table</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-auto">
            <div className="form-group form-row">
              <label htmlFor="table_name" className="col-md-4 col-form-label">
                Table Name:
              </label>
              <div className="col-8 pt-2">
                <input
                  id="table_name"
                  type="text"
                  name="table_name"
                  className="form-control"
                  onChange={handleChange}
                  value={formData.table_name}
                  required={true}
                />
              </div>
            </div>
            <div className="form-group form-row">
              <label htmlFor="capacity" className="col-md-4 col-form-label">
                Capacity:
              </label>
              <div className="col-3 pt-2">
                <input
                  id="capacity"
                  type="number"
                  name="capacity"
                  className="form-control"
                  onChange={handleChange}
                  required={true}
                  min="1"
                  value={formData.capacity}
                />
              </div>
            </div>
            <div
              className="btn-toolbar mb-5"
              role="toolbar"
              aria-label="Toolbar with form actions buttons"
            >
              <button
                type="button"
                value="Cancel"
                className="btn btn-secondary mr-5"
                onClick={handleCancel}
              >
                <span className="oi oi-action-undo mr-2" />
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit
                <span className="oi oi-check ml-2" />
              </button>
            </div>
          </div>
        </div>
      </form>
      <ErrorAlert error={tablesError} />
    </section>
  );
}

export default NewTable;