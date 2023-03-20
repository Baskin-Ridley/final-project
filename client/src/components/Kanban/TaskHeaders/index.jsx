import React, { useState } from "react";
import { DndContext, useDraggable, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "../SortableItem/Index";

const TaskHeader = () => {
  const [testHeaders, setTestHeaders] = useState([
    {
      id: 1,
      title: "To Do",
      color: "bg-red-500",
    },
    {
      id: 2,
      title: "In Progress",
      color: "bg-blue-500",
    },
    {
      id: 3,
      title: "Done",
      color: "bg-green-500",
    },
  ]);

  function handleDragEnd(event) {
    console.log("Drag ended");
    const { active, over } = event;

    if (active.id !== over.id) {
      setTestHeaders((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reorderedItems = [...items];
        const [removed] = reorderedItems.splice(oldIndex, 1);
        reorderedItems.splice(newIndex, 0, removed);

        return reorderedItems;
      });
    }
    //this is where we can update the database
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex space-x-4">
        <SortableContext
          items={testHeaders}
          strategy={verticalListSortingStrategy}
        >
          {testHeaders.map((header) => (
            <SortableItem key={header.id} id={header.id}>
              <div
                className={`flex items-center justify-center w-32 h-12 rounded-md ${header.color}`}
              >
                <h3 className="text-white">{header.title}</h3>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default TaskHeader;
