import * as yup from "yup";

export const validationSchema = yup.object({
    email: yup.string().email("Enater a valid email").required("Email is required"),
    name: yup.string().required("Name is required")
});