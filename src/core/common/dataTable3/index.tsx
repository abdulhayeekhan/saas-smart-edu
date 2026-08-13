import React, { useEffect, useState } from "react";
import { Table, Spin } from "antd";
import { DatatableProps } from "../../data/interface";

const Datatable: React.FC<DatatableProps> = ({ columns, dataSource, Selection, loading }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [Selections, setSelections] = useState<boolean>(true);
  const [filteredDataSource, setFilteredDataSource] = useState(dataSource);
  //const [loading, setLoading] = useState<boolean>(false); // loader state

  const onSelectChange = (newSelectedRowKeys: any[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setTimeout(() => {
      const filteredData = dataSource.filter((record) =>
        Object.values(record).some((field) =>
          String(field).toLowerCase().includes(value.toLowerCase())
        )
      );
      setFilteredDataSource(filteredData);
    }, 300); // simulate small delay
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // ✅ keep filteredDataSource in sync
  useEffect(() => {
    setFilteredDataSource(dataSource);
  }, [dataSource]);

  // ✅ handle selection toggle
  useEffect(() => {
    setSelections(Selection ?? true);
  }, [Selection]);

  return (
    <>
      <div className="table-top-data d-flex px-3 justify-content-between">
        <div className="page-range"></div>
        <div className="serch-global text-right">
          <input
            type="search"
            className="form-control form-control-sm mb-3 w-auto float-end"
            value={searchText}
            placeholder="Search"
            onChange={(e) => handleSearch(e.target.value)}
            aria-controls="DataTables_Table_0"
          />
        </div>
      </div>

      <Table
        className="table datanew dataTable no-footer"
        rowKey="id"
        rowSelection={!Selections ? undefined : rowSelection}
        columns={columns}
        rowHoverable={false}
        dataSource={filteredDataSource}
        loading={{
          spinning: loading ?? false, //controlled from parent
          indicator: <Spin size="large" />,
        }}
        pagination={false}
      />
    </>
  );
};

export default Datatable;
