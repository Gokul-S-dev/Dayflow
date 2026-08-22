import fs from "fs";
import path from "path";
import crypto from "crypto";
import { generateCompanyPrefix } from "../utils/idGenerator.js";
import * as companyRepository from "../repositories/company.repository.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Creates a new company record, generates a prefix, moves the logo from temp to a company-specific directory, and updates logo metadata.
 */
export const createCompany = async (companyName, tempFile) => {
  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    // Delete temp file if uploaded
    if (tempFile && fs.existsSync(tempFile.path)) {
      fs.unlinkSync(tempFile.path);
    }
    throw new AppError("Company name is required", 400);
  }

  if (!tempFile) {
    throw new AppError("Company logo file is required", 400);
  }

  // 1. Check if company name already exists
  const existingCompany = await companyRepository.findByName(companyName);
  if (existingCompany) {
    if (fs.existsSync(tempFile.path)) {
      fs.unlinkSync(tempFile.path);
    }
    throw new AppError("Company with this name already exists", 409);
  }

  let company;
  try {
    // 2. Create the company record in DB to get the ID
    const prefix = generateCompanyPrefix(companyName);
    company = await companyRepository.create({
      name: companyName,
      prefix
    });
  } catch (error) {
    if (fs.existsSync(tempFile.path)) {
      fs.unlinkSync(tempFile.path);
    }
    throw error;
  }

  const companyId = company._id.toString();
  const destDir = path.join(process.cwd(), "media", "companies", companyId, "logo");
  const ext = path.extname(tempFile.originalname).toLowerCase();
  const uniqueSuffix = crypto.randomBytes(8).toString("hex");
  const uniqueName = `${uniqueSuffix}-logo${ext}`;
  const destPath = path.join(destDir, uniqueName);

  try {
    // 3. Create destination directory
    fs.mkdirSync(destDir, { recursive: true });

    // 4. Move file from temp to final destination
    fs.renameSync(tempFile.path, destPath);
  } catch (error) {
    // Clean up temp file
    if (fs.existsSync(tempFile.path)) {
      try { fs.unlinkSync(tempFile.path); } catch (e) {}
    }
    // Clean up created company record
    await companyRepository.deleteById(companyId);
    throw new AppError("Failed to store company logo on disk", 500);
  }

  // 5. Update company document with logo metadata
  const logoUrl = `/media/companies/${companyId}/logo/${uniqueName}`;
  const logoPath = `media/companies/${companyId}/logo/${uniqueName}`;

  try {
    const updatedCompany = await companyRepository.update(companyId, {
      logo: {
        url: logoUrl,
        path: logoPath,
        mimeType: tempFile.mimetype,
        size: tempFile.size
      }
    });
    return updatedCompany;
  } catch (error) {
    // Clean up moved file
    if (fs.existsSync(destPath)) {
      try { fs.unlinkSync(destPath); } catch (e) {}
    }
    // Clean up created company record
    await companyRepository.deleteById(companyId);
    throw error;
  }
};
