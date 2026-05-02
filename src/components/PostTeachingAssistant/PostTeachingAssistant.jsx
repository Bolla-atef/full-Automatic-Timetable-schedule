import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import {
  Input,
  Button,
  Dialog,
  IconButton,
  Typography,
  DialogBody,
  DialogHeader,
  DialogFooter,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";

export default function PostTeachingAssistant({ open, handleOpen, isEdit = false, editTeachingAssistant = null }) {
  const dayMap = {
    Saturday: "sat",
    Sunday: "sun",
    Monday: "mon",
    Tuesday: "tue",
    Wednesday: "wed",
    Thursday: "thu",
    Friday: "fri"
  };

  const queryClient = useQueryClient();
  const [teachingAssistant, setTeachingAssistant] = useState({ id: "", name: "", availability: [] });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && editTeachingAssistant) {
      const selectedDays = Object.keys(dayMap).filter(
        (day) => editTeachingAssistant[dayMap[day]] === true
      );
      setTeachingAssistant({
        id: editTeachingAssistant.id.toString(),
        name: editTeachingAssistant.name,
        availability: selectedDays
      });
    } else if (!isEdit) {
      // Reset form when opening for new teaching assistant
      setTeachingAssistant({ id: "", name: "", availability: [] });
      setMessage("");
    }
  }, [isEdit, editTeachingAssistant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "id" && !/^\d*$/.test(value)) return;
    setTeachingAssistant({ ...teachingAssistant, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setTeachingAssistant((prev) => {
      const updatedAvailability = checked
        ? [...prev.availability, name]
        : prev.availability.filter((day) => day !== name);
      return { ...prev, availability: updatedAvailability };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const daysObject = {};
      Object.values(dayMap).forEach((short) => {
        daysObject[short] = teachingAssistant.availability.includes(
          Object.keys(dayMap).find((k) => dayMap[k] === short)
        );
      });

      const teachingAssistantData = {
        id: isEdit ? parseInt(teachingAssistant.id, 10) : 0,
        name: teachingAssistant.name.trim(),
        numberAssignedCourses: 1,
        ...daysObject,
      };

      const url = isEdit
        ? `${import.meta.env.VITE_API_URL}/api/TeachingAssistants/${teachingAssistant.id}`
        : `${import.meta.env.VITE_API_URL}/api/TeachingAssistants`;
      const method = isEdit ? "put" : "post";

      await axios[method](url, teachingAssistantData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });

      queryClient.invalidateQueries(["teachingAssistants"]);
      setMessage("✅Saving Data ");
      setTeachingAssistant({ id: "", name: "", availability: [] });
      handleOpen();
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || "حدث خطأ ما"}`);
    }

    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} handler={handleOpen} size="lg" className="p-4 max-h-[80vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Typography variant="h4">إضافة مساعد تدريس</Typography>
          <IconButton onClick={handleOpen} className="absolute bg-white right-4 top-4">
            <XMarkIcon className="bg-red-500" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <Input
            placeholder="Name Teaching Assistant"
            name="name"
            value={teachingAssistant.name}
            onChange={handleChange}
          />
          <div>
            <label className="block mb-1 font-semibold">Available days</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(dayMap).map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={day}
                    checked={teachingAssistant.availability.includes(day)}
                    onChange={handleCheckboxChange}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
          {message && <p className="text-sm text-red-500">{message}</p>}
        </DialogBody>
        <DialogFooter>
          <Button className="text-black" onClick={handleSubmit} loading={loading}>
            Submit
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}