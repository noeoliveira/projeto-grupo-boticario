import { Type } from "class-transformer";
import {
  IsString,
  IsISO8601,
  IsNumber,
  IsPositive,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { IPurchase, IStatus } from "../../../domain/Interfaces";
import { ConsultantDTO } from "../../ConsultantService";

class StatusDTO implements IStatus {
  constructor(data: Partial<IStatus>) {
    Object.assign(this, data);
  }

  @IsNumber()
  @IsPositive()
  id!: number;

  @IsString()
  description!: string;
}

export class PurchaseDTO implements Omit<IPurchase, "consultant"> {
  constructor(data: Partial<Omit<IPurchase, "consultant">>) {
    Object.assign(this, data);
  }
  @IsString()
  code_purchase!: string;

  @IsNumber()
  value!: number;

  @IsISO8601()
  date_purchase!: Date;

  @IsNumber()
  @IsPositive()
  cashback_percentage!: number;

  @IsNumber()
  cashback_value!: number;

  @Type(() => ConsultantDTO)
  @IsOptional()
  @ValidateNested({ each: true })
  consultant!: ConsultantDTO;

  @Type(() => StatusDTO)
  @ValidateNested()
  status!: StatusDTO;
}