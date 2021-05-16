import * as yup from "yup";

export const validationSchema = yup.object({
   currentUsers: yup.number().required("Current users is required"),
   ipAddress: yup.string().required("Ip Address is required!")
});