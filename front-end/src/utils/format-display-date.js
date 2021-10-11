export default function formatDisplayDate(date, format) {
    const dateTime = `${date}T00:00:00`;
    const dateObject = new Date(dateTime);
  
    // takes the "YYYY-MM-DD" format, like "2021-08-10" and returns:
  
    // "Aug 10 (Tue)"
    if (format === "short") {
      const gotDate = dateObject.getDate();
      const gotDay = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }).format(dateObject);
      const gotMonth = new Intl.DateTimeFormat("en-US", {
        month: "short",
      }).format(dateObject);
  
      return `${gotMonth} ${gotDate} (${gotDay}) `;
    }
    // "Tuesday, Aug 10, 2021"
    else if (format === "long") {
      return dateObject.toLocaleDateString("en-us", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } else {
      // "Tue Aug 10 2021"
      return dateObject.toDateString();
    }
  }