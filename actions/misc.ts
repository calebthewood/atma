"use server";

export async function flodeskSubmit(
  formId: string,
  formState: { firstName: string; lastName: string; email: string }
) {
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
