"use client";

import React, { useState } from "react";
import { flodeskSubmit } from "@/actions/misc";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const FlodeskStyledForm = ({ formId = "66d66e18780dc961677cd3c5" }) => {
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await flodeskSubmit(formId, formState);
      console.log("response ", response);
      if (response) {
        setIsSuccess(true);
        setError("");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit form. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full">
      <div className="mx-auto">
        <form onSubmit={handleSubmit} className="w-full p-8">
          {!isSuccess ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {" "}
              <Input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formState.firstName}
                onChange={handleChange}
              />
              <Input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formState.lastName}
                onChange={handleChange}
              />{" "}
              <Input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={formState.email}
                onChange={handleChange}
                className="col-span-1 md:col-span-1"
              />
              <Button
                type="submit"
                className="col-span-1 md:col-span-3 md:mx-auto md:max-w-32"
              >
                Subscribe
              </Button>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-lg text-green-800">
              <p className="max-w-lg">
                Thank you. We're excited to share our curated experiences with
                you.
              </p>
            </div>
          )}
          {error && <div className="mt-4 text-sm text-red-800">{error}</div>}
        </form>
      </div>
    </div>
  );
};
