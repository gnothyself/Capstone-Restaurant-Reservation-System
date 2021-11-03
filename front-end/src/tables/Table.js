import { listTables, finishTable } from "../utils/api";

export default function Table({ data, setTables}) {
  const clickHandler = (event) => {
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();
      finishTable(data.table_id, abortController.signal)
        .then(() => listTables().then(setTables))
        .catch(listTables().then(setTables));
    }
  };
  return (
    <div className="card" key={data.table_id}>
      <div className="card-body">
        <h5 className="card-title">Table: {`${data.table_name}`}</h5>
        <p className="card-text">Capacity: {data.capacity}</p>
        <p
          className={
            data.reservation_id
              ? "card-text text-danger"
              : "card-text text-success"
          }
          data-table-id-status={data.table_id}
        >
          {data.reservation_id ? "Occupied" : "Free"}
        </p>
        {data.reservation_id ? (
          <button
            className="btn btn-primary"
            onClick={clickHandler}
            data-table-id-finish={data.table_id}
          >
            Finish
          </button>
        ) : null}
      </div>
    </div>
  );
}