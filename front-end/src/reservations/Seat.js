import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { readReservation, listTables, seatTable } from "../utils/api";
// import Reservation from "./Reservation";

export default function Seat() {
    const initialFormState = {
        table_name: "",
        capacity: null,
        table_id: "",
    };
    const [form, setForm] = useState({...initialFormState});
    const [reservation, setReservation] = useState({});
    const [tables, setTables] = useState([]);
    const [seatError, setSeatError] = useState(null);

    const history = useHistory();
    const { reservation_id } = useParams();

    // read reservation from database by reservation_id
    // load all tables from database
    useEffect(() => {
        const abortController = new AbortController();

        async function loadData() {
            try {
                const reservationResponse = await readReservation(reservation_id, abortController.signal);
                const tablesResponse = await listTables(abortController.signal);
                const freeTables = tablesResponse.filter(table => {
                    return table.status === "Free";
                });
                setReservation(reservationResponse);
                setTables(freeTables);
            } catch (error) {
                setSeatError([error.message]);
            }
        }
        loadData();
        return () => abortController.abort();
    }, [reservation_id]);

    const handleChange = ({ target }) => {
        const selectedTable = tables.find(table => table.table_id === parseInt(target.value));
        if (selectedTable && selectedTable.capacity < reservation.people) {
            setSeatError(new Error("Reservation party size will not fit at selected table."));
        } else if (!selectedTable) {
            setSeatError(new Error("Please select a table."));
        } else {
            setSeatError(null);
        }
        // set the form state
        setForm({
            ...form,
            [target.name]: target.value,
        });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const abortController = new AbortController();
        // PUT request
        async function seatReservation() {
            try {
                await seatTable(form, reservation_id, abortController.signal);
                history.push("/dashboard");
            } catch (error) {
                setSeatError([...seatError, error.message]);
            }
        }
        // do not send PUT request if there is a pending error message
        if (seatError === null) {
            seatReservation();
        }
    }

    return(
        <div>
            <h3>Assign Table</h3>
            <form name="seat" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="table_id">
                        Table Number</label>
                        <select
                            className="form-control"
                            id="table_id"
                            name="table_id"
                            onChange={handleChange}
                            value={form.table_id}
                            required
                        >
                            <option>
                                Select a Table</option>
                                {tables.map(table => (
                                    <option key={table.table_id} value={table.table_id}>
                                        {table.table_name} - {table.capacity}
                                    </option>
                                ))}
                        </select>       
                </div>
                <button className="btn btn-dark" type="submit">Submit</button>
                <button className="btn btn-dark ml-3" type="button" onClick={() => history.goBack()}>Cancel</button>
            {seatError ? <ErrorAlert error={seatError} /> : null}
            </form>
        </div>
    );
}