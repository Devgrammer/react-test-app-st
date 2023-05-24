import React, { useEffect, useState, useRef } from "react";
import { Select } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ pagination }) => {
  // Function to get contact ID from URL query parameter
  const getContactIdFromURL = () => {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get("contacts");
  };

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [selected, setSelected] = useState("");
  const [IsOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");

  const [searchString, setSearchString] = useState("");

  const selectRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        const token = process.env.REACT_APP_BACKEND_TOKEN;
        const config = {
          headers: {
            Authorization: `Token ${token}`, // Add comment: Set Authorization header with the token
          },
        };

        let url = `https://inventory-dev-295903.appspot.com/purchases/contacts/?search=${searchString}`;
        const response = await axios.get(url, config);
        let datas = response.data;
        setData(datas);

        const contactId = getContactIdFromURL();
        if (contactId) {
          setDefaultValue(contactId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [searchString]);

  // Function to handle click outside of the select dropdown
  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleDropdownVisibleChange = (open) => {
    setIsOpen(open);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSearch = (value) => {
    setSearchString(value);
  };

  const handleSelect = (value) => {
    setSelected(value);
    navigate(
      `/products/?paginate=${pagination}&contacts=${value ? value : ""}`
    );
  };

  const handleValue = () => {
    let c_id = getContactIdFromURL();
    if (c_id) {
      if (selected) {
        return selected;
      } else {
        let contact = data?.results?.find((val) => {
          return val?.id?.toString() === c_id && val;
        });
        console.log(
          "con",
          contact,
          data?.results[0]?.id,
          contact?.first_name +
            " " +
            contact?.last_name +
            "-" +
            contact?.company_name
        );
        return (
          contact &&
          contact?.first_name +
            " " +
            contact?.last_name +
            "-" +
            contact?.company_name
        );
      }
    } else {
      return selected;
    }
  };

  return (
    <>
      {/* Select component */}
      <Select
        allowClear
        showSearch
        size="default"
        open={IsOpen}
        loading={loading}
        filterOption={false}
        value={handleValue()}
        optionLabelProp="label"
        style={{ width: "50%" }}
        optionFilterProp="children"
        placeholder="Select for Supplier"
        onSearch={onSearch}
        onSelect={handleSelect}
        onDropdownVisibleChange={handleDropdownVisibleChange}
      >
        {/* Loading option */}
        {loading && (
          <Select.Option key="loading" value="loading">
            Loading...
          </Select.Option>
        )}

        {/* Data options */}
        {data &&
          data?.results?.map((item, index) => {
            return (
              <Select.Option
                key={item?.id}
                value={item?.id}
                label={
                  item?.first_name +
                  " " +
                  item?.last_name +
                  "-" +
                  item.company_name
                }
              >
                {/* Option content */}
                <div style={{ fontSize: "14px" }}>
                  <div>{item?.first_name + " " + item?.last_name}</div>
                  <div>Company: {item.company_name}</div>
                </div>
              </Select.Option>
            );
          })}
      </Select>
    </>
  );
};

export default SearchBar;
