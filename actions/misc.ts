"use server";

import { access, appendFile, writeFile } from "node:fs/promises";

export async function flodeskSubmit(
  formId: string,
  formState: { firstName: string; lastName: string; email: string }
) {
  await appendToCSV(formState);

  const response = await fetch(
    `https://form.flodesk.com/forms/${formId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    }
  );
  console.log("server", response.body);
  return response.ok;
}

export async function appendToCSV(data: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  try {
    const { firstName, lastName, email } = data;
    const csvLine = `${firstName},${lastName},${email}\n`;

    // Check if file exists, if not create with headers
    try {
      await access("subscribers.csv");
    } catch {
      await writeFile("subscribers.csv", "firstName,lastName,email\n");
    }

    // Append the new line
    await appendFile("subscribers.csv", csvLine);

    console.log("Successfully appended to CSV");
  } catch (error) {
    console.error("Error appending to CSV:", error);
  }
}
