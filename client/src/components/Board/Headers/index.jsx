import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Button from "../../Button";
import Input from "../../Input";
import TicketPopUp from "../TicketPopUp";
import "./style.css";

const initialHeaders = [];
// const initialHeaders = [
//   {
//     id: "header-1",
//     name: "Header 1",
//     items: [
//       { id: "0-item-0", content: "Item 1" },
//       {
//         id: "0-item-1",
//         content: "Item 2",
//         comment: "This is a comment",
//         assigned: [
//           { id: "1", name: "John Doe" },
//           { id: "2", name: "Jane Doe" },
//         ],
//       },
//     ],
//   },
//   {
//     id: "header-2",
//     name: "Header 2",
//     items: [
//       { id: "1-item-0", content: "Item 3" },
//       { id: "1-item-1", content: "Item 4" },
//     ],
//   },
//   {
//     id: "header-3",
//     name: "Header 3",
//     items: [
//       { id: "2-item-0", content: "Item 5" },
//       { id: "2-item-1", content: "Item 6" },
//     ],
//   },
// ];

const Headers = ({ board_id }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  function handleTicketClick(ticketContent) {
    setSelectedTicket(ticketContent.content);
    setIsOpen(true);
    console.log(selectedTicket);
  }
  const fetchKanbanBoardData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/kanban-boards/${board_id}`
      );
      const data = await response.json();
      const header = data.boards_headers[0];

      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchKanbanBoardTickets = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/kanban-boards/${board_id}/tickets`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const boardData = await fetchKanbanBoardData();
      const ticketsData = await fetchKanbanBoardTickets();

      const headersData = Array.isArray(boardData.boards_headers)
        ? boardData.boards_headers
        : [boardData.boards_headers];

      const updatedHeaders = headersData.map((header) => {
        const headerTickets = ticketsData.filter(
          (ticket) => ticket.header_id === header.header_id
        );
        // console.log(headerTickets[0])
        return {
          id: `header-${header.header_id}`,
          name: header.header_name,
          items: headerTickets.map((ticket) => ({
            id: `item-${ticket.ticket_id}`,
            content: ticket.ticket_content,
          })),
        };
      });

      setHeaders(updatedHeaders);
    };

    fetchData();
  }, []);

  const [headers, setHeaders] = useState(initialHeaders);

  const [newItemNames, setNewItemNames] = useState(headers.map(() => ""));

  const [newHeaderName, setNewHeaderName] = useState("");

  const handleAddHeader = () => {
    if (newHeaderName.trim() === "") {
      alert("Please enter a header name");
      return;
    }
    const newHeaderId = `header-${Date.now()}`;
    const newHeader = { id: newHeaderId, name: newHeaderName, items: [] };

    setHeaders((prevState) => [...prevState, newHeader]);
    setNewHeaderName(""); // Clear the input field after adding the header
  };

  const handleNewItemNameChange = (headerId, newValue) => {
    setNewItemNames((prevState) =>
      prevState.map((name, index) =>
        headers[index].id === headerId ? newValue : name
      )
    );
    // console.log(newItemNames)
  };

  useEffect(() => {
    setNewItemNames(headers.map(() => ""));
  }, [headers]);

  // useEffect(() => {
  //   console.log(newItemNames);
  // }, [newItemNames]);

  // const handleAddSubItem = (headerId) => {
  //   //headerIndex - WORKING
  //   const headerIndex = headers.findIndex((header) => header.id === headerId);
  //   //ItemName returns undefined?
  //   const itemName = newItemNames[headerIndex];
  //   console.log(itemName, 'itemName')
  //   console.log(headerId, 'headerId')
  //   if (itemName) {
  //     const newSubItemId = `item-${Date.now()}`;
  //     const newSubItem = { id: newSubItemId, content: itemName };

  //     setHeaders((prevState) =>
  //       prevState.map((header) =>
  //         header.id === headerId
  //           ? { ...header, items: [...header.items, newSubItem] }
  //           : header
  //       )
  //     );
  //     setNewItemNames((prevState) =>
  //       prevState.map((name, index) => (index === headerIndex ? "" : name))
  //     );
  //   }
  // };

  const handleAddSubItem = (headerId) => {
    const headerIndex = headers.findIndex((header) => header.id === headerId);
    const itemName = newItemNames[headerIndex];
    if (itemName) {
      const newSubItemId = `item-${Date.now()}`;
      const newSubItem = { id: newSubItemId, content: itemName };
      setHeaders((prevState) =>
        prevState.map((header) =>
          header.id === headerId
            ? { ...header, items: [...header.items, newSubItem] }
            : header
        )
      );
      setNewItemNames((prevState) =>
        prevState.map((name, index) => (index === headerIndex ? "" : name))
      );
    }
    console.log(newItemNames);
  };

  const handleOnDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === "header") {
      const items = Array.from(headers);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setHeaders(items);
    } else if (type === "item") {
      const sourceHeaderIndex = headers.findIndex(
        (header) => `column-${header.id}` === source.droppableId
      );
      const destinationHeaderIndex = headers.findIndex(
        (header) => `column-${header.id}` === destination.droppableId
      );

      if (sourceHeaderIndex === destinationHeaderIndex) {
        const header = headers[sourceHeaderIndex];
        const newItems = Array.from(header.items);
        const [reorderedItem] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, reorderedItem);
        header.items = newItems;
        console.log(newItems);
        setHeaders([...headers]);
      } else {
        const sourceHeader = headers[sourceHeaderIndex];
        const destinationHeader = headers[destinationHeaderIndex];
        const [movedItem] = sourceHeader.items.splice(source.index, 1);
        destinationHeader.items.splice(destination.index, 0, movedItem);
        setHeaders([...headers]);
        console.log(destinationHeader.items);
      }
    }
  };

  return (
    <div>
      <div>
        {selectedTicket && (
          <div className="">
            <TicketPopUp
              ticketContent={selectedTicket}
              setIsOpen={setIsOpen}
              isOpen={isOpen}
            />
          </div>
        )}
      </div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="headers" direction="horizontal" type="header">
          {(provided) => (
            <div
              className="flex justify-between"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {headers.map(({ id, name, items }, index) => (
                <Draggable key={id} draggableId={id} index={index}>
                  {(provided) => (
                    <div
                      className="w-64 bg-gray-200 border border-gray-400 rounded-lg px-2 py-3 m-2"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <h2 className="text-lg font-bold mb-2">{name}</h2>
                      <Droppable droppableId={`column-${id}`} type="item">
                        {(provided) => (
                          <div
                            className="min-h-20 p-2 bg-gray-100 rounded-lg border-dashed border-transparent hover:border-gray-400 hover:bg-gray-200 transition-colors duration-150"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {items.map(({ id, content }, index) => (
                              <Draggable
                                key={id}
                                draggableId={id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    className="bg-white rounded-md py-2 px-4 mb-2 text-sm shadow-md hover:bg-blue-500 hover:text-white transition-colors duration-150"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() =>
                                      handleTicketClick({ content })
                                    }
                                  >
                                    {content}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <Input
                        type="text"
                        className="p-2 bg-gray-100 rounded-lg border border-gray-400 mb-2"
                        value={newItemNames[index]}
                        onChange={(e) =>
                          handleNewItemNameChange(id, e.target.value)
                        }
                      />
                      <Button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-150"
                        onClick={() => handleAddSubItem(id)}
                      >
                        Add Item
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              <div className="w-64 bg-gray-200 border border-gray-400 rounded-lg px-2 py-3 m-2">
                <Input
                  type="text"
                  className="p-2 bg-gray-100 rounded-lg border border-gray-400 mb-2"
                  value={newHeaderName}
                  onChange={(e) => setNewHeaderName(e.target.value)}
                />
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-150"
                  onClick={handleAddHeader}
                >
                  Add Header
                </Button>
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Headers;
