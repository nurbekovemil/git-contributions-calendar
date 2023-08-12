import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ruLocale from "date-fns/locale/ru";
const DAYS_IN_WEEK = 7;
const NUM_COLUMNS = 51;
const NUM_ROWS = DAYS_IN_WEEK;

const Con = () => {
  const [contribs, setContribs] = useState([]);
  const [startDate, setStateDate] = useState(new Date());
  const months = [
    { numberMonth: "01", label: "Янв" },
    { numberMonth: "02", label: "Фев" },
    { numberMonth: "03", label: "Мар" },
    { numberMonth: "04", label: "Апр" },
    { numberMonth: "05", label: "Май" },
    { numberMonth: "06", label: "Июнь" },
    { numberMonth: "07", label: "Июль" },
    { numberMonth: "08", label: "Авг" },
    { numberMonth: "09", label: "Сен" },
    { numberMonth: "10", label: "Окт" },
    { numberMonth: "11", label: "Ноя" },
    { numberMonth: "12", label: "Дек" },
  ];
  const weeks = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const computed = async () => {
    let getContData = await fetch("https://dpg.gg/test/calendar.json")
      .then((res) => res.json())
      .then((data) => data);
    // const endDate = new Date().setDate(startDate.getDate() - 50 * DAYS_IN_WEEK);
    const currentDate = new Date(startDate);

    let newData = [];
    for (let i = 0; i < NUM_COLUMNS; i++) {
      const weekData = [];
      for (let j = 0; j < DAYS_IN_WEEK; j++) {
        weekData.push({ [currentDate.toISOString().split("T")[0]]: 0 });
        currentDate.setDate(currentDate.getDate() - 1);
      }
      newData = [...newData, ...weekData];
    }
    newData.forEach((item) => {
      const key = Object.keys(item)[0]; // Assuming each item only has one key
      if (getContData.hasOwnProperty(key)) {
        item[key] = getContData[key];
      }
    });
    setContribs(newData.reverse());
  };
  const arrayMonth = contribs.map((obj) => {
    const dateStr = Object.keys(obj)[0]; // Get the date string from the object
    const monthLabel = months.find(
      (month) => month.numberMonth === dateStr.split("-")[1]
    )?.label; // Find corresponding month label

    return {
      [dateStr]: monthLabel || 0, // Use the month label if found, otherwise use 0
    };
  });

  const groupedData = arrayMonth.reduce((result, item) => {
    const [date, month] = Object.entries(item)[0]; // Get the date and month
    const year = date.split("-")[0]; // Extract the year
    if (!result[year]) {
      result[year] = {};
    }
    result[year][month] = true;

    return result;
  }, {});
  const groupedArray = Object.entries(groupedData).map(([year, months]) => {
    return { [year]: Object.keys(months) };
  });
  const allMonths = groupedArray.reduce((months, yearObj) => {
    const monthArrays = Object.values(yearObj);
    for (const monthArray of monthArrays) {
      months.push(...monthArray);
    }
    return months;
  }, []);
  allMonths.shift();
  useEffect(() => {
    computed();
  }, []);
  return (
    <>
      <div className="contribMonths">
        {allMonths.map((mon) => (
          <div className="contribMonthsItem">{mon}</div>
        ))}
      </div>
      <div className="contribs">
        {weeks.map((w) => (
          <div>{w}</div>
        ))}
        {contribs.map((con, i) => (
          <ContItem value={Object.values(con)[0]} date={Object.keys(con)[0]} />
        ))}
      </div>
    </>
  );
};

const ContItem = ({ value, date }) => {
  const inputDate = new Date(date);
  const formattedDate = format(inputDate, "EEEE, LLLL, dd, yyyy", {
    locale: ruLocale,
  });

  const color =
    value >= 1 && value <= 9
      ? "#abd5f2"
      : value >= 9 && value <= 20
      ? "#7fa8c9"
      : value >= 20 && value <= 30
      ? "#527ba0"
      : value >= 30
      ? "#527ba0"
      : "";

  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleClick = (event) => {
    event.target.classList.toggle("active");
    const rect = event.target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    const top = rect.top + scrollTop;
    const left = rect.left + scrollLeft;
    setPosition({ top, left });
  };

  return (
    <div
      className="contribItem"
      onClick={handleClick}
      style={{ background: color }}
    >
      <span
        className="tooltip-text"
        id="top"
        style={{ top: position.top - 60, left: position.left - 73 }}
      >
        <p>{value} contributions</p>
        <p>{formattedDate}</p>
      </span>
    </div>
  );
};

export default Con;
