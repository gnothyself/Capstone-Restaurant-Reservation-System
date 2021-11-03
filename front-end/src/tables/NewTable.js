import React from "react";
import TableForm from "./TableForm";

export default function NewTable() {

    return (
        <section>
            <div className="headingBar d-md-flex my-3 p-2">
                <h1>New Table</h1>
            </div>
            <TableForm />
        </section>
    );
}