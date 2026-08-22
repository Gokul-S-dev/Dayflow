import { Company } from "../models/company.model.js";

export const findByName = async (name) => {
  return Company.findOne({ name });
};

export const create = async (companyData) => {
  return Company.create(companyData);
};

export const update = async (id, updateData) => {
  return Company.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const deleteById = async (id) => {
  return Company.findByIdAndDelete(id);
};
