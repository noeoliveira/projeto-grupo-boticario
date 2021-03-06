import faker from "faker";
import cpf from "cpf";
import {
  PurchaseService,
  PurchaseDTO,
} from "../../application/PurchaseService";
import { AppError } from "../../shared";
import {
  MockPurchaseRepository,
  MockConsultantRepository,
  MockStatusRepository,
} from "../mock/infra/Repository";

faker.setLocale("pt_BR");

describe("PurchaseService", () => {
  const mockPurchaseRepository = new MockPurchaseRepository();
  const mockConsultantRepository = new MockConsultantRepository();
  const mockStatusRepository = new MockStatusRepository();
  const purchaseService = new PurchaseService(
    mockPurchaseRepository,
    mockConsultantRepository,
    mockStatusRepository
  );

  const dataConsultant = {
    cpf: cpf.generate(false),
    email: faker.internet.email(),
    name: `${faker.name.firstName()} ${faker.name.middleName()} ${faker.name.lastName()}`,
    password: faker.internet.password(8),
  };

  const dataPurchase = {
    code_purchase: faker.random.alphaNumeric(6),
    date_purchase: faker.date.recent(),
    value: Number(faker.finance.amount(undefined, 5000)),
    id_consultant: dataConsultant.cpf,
  };

  it("should be able to create a new purchase", async () => {
    await mockConsultantRepository.save(dataConsultant);

    const purchase = await purchaseService.save(dataPurchase);

    expect(purchase).toBeInstanceOf(PurchaseDTO);
    expect(
      Number(
        (dataPurchase.value * (purchase.cashback_percentage / 100)).toFixed(2)
      )
    ).toBe(purchase.cashback_value);

    expect(
      purchaseService.save({ ...dataPurchase, id_consultant: cpf.generate() })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to duplicate code purchase", async () => {
    expect(purchaseService.save(dataPurchase)).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to search a purchase by Code", async () => {
    const purchase = await purchaseService.findByCode(
      dataPurchase.code_purchase
    );

    expect(purchase).toBeInstanceOf(PurchaseDTO || undefined);
  });

  it("should be able to get all purchase by Code", async () => {
    const purchase = await purchaseService.findAll();

    expect(Array.isArray(purchase)).toBe(true);
  });

  it("should be able to update purchase by Code", async () => {
    const purchase = await purchaseService.update(dataPurchase.code_purchase, {
      value: 3000,
    });

    expect(
      Number((3000 * (purchase.cashback_percentage / 100)).toFixed(2))
    ).toBe(purchase.cashback_value);
  });

  it("should be able to delete purchase by Code", async () => {
    const purchaseDeleted = await purchaseService.delete(
      dataPurchase.code_purchase
    );

    expect(Array.isArray(purchaseDeleted)).toBe(true);

    expect(
      purchaseService.delete(faker.random.alphaNumeric(6))
    ).rejects.toBeInstanceOf(AppError);
  });
});
