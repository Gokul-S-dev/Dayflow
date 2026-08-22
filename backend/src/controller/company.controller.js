import * as companyService from "../services/company.service.js";

export const createCompany = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    const tempFile = req.file;

    const company = await companyService.createCompany(companyName, tempFile);

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company
    });
  } catch (err) {
    next(err);
  }
};
