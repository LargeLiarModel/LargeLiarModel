import {
  integer,
  real,
  text,
  sqliteTable,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const Candidate = sqliteTable("Candidate", {
  id: integer().primaryKey({ autoIncrement: true }),
  CID: text().notNull(),
  Firstlast: text().notNull(),
});

// https://www.opensecrets.org/resources/datadictionary/Data%20Dictionary%20Candidates%20Data.htm
export const Candidacies = sqliteTable(
  "Candidacies",
  {
    Cycle: integer(),
    FECCandID: text(),
    CID: text().references(() => Candidate.CID, { onDelete: "cascade" }),
    Party: text(),
    DistIDRunFor: text(),
    DistIDCurr: text(),
    CurrCand: text(),
    CycleCand: text(),
    CRPICO: text(),
    RecipCode: text(),
    NoPacs: text(),
  },
  (table) => [primaryKey({ columns: [table.Cycle, table.FECCandID] })]
);

// https://www.opensecrets.org/resources/datadictionary/Data%20Dictionary%20for%20Cmtes.htm
export const Committees = sqliteTable("Committees", {
  Cycle: integer(),
  CmteID: text().primaryKey(),
  PACShort: text(),
  Affiliate: text(),
  UltOrg: text(),
  RecipID: text(),
  RecipCode: text(),
  FECCandID: text(),
  Party: text(),
  PrimCode: text(),
  Source: text(),
  Sensitive: text(),
  ForeignOwned: integer({ mode: "boolean" }),
  Active: integer({ mode: "boolean" }),
});

// https://www.opensecrets.org/resources/datadictionary/Data%20Dictionary%20for%20PAC%20to%20Cands%20Data.htm
export const PAC_Candidate = sqliteTable(
  "PAC_Candidate",
  {
    Cycle: integer(),
    FECRecNo: text().primaryKey(),
    PACID: text().references(() => Committees.CmteID, { onDelete: "cascade" }),
    CID: text().references(() => Candidate.CID, { onDelete: "cascade" }),
    Amount: real(),
    Date: text(),
    RealCode: text(),
    Type: text(),
    DI: text(),
    FECCandID: text().references(() => Candidacies.FECCandID, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.Cycle, table.FECRecNo] })]
);

// https://www.opensecrets.org/resources/datadictionary/Data%20Dictionary%20PAC%20to%20PAC%20Data.htm
export const PAC_PAC = sqliteTable(
  "PAC_PAC",
  {
    Cycle: integer(),
    FECRecNo: text().primaryKey(),
    FilerID: text(),
    DonorCmte: text(),
    ContribLendTrans: text(),
    City: text(),
    State: text(),
    Zip: text(),
    FECOccEmp: text(),
    PrimCode: text(),
    Date: text(),
    Amount: real(),
    RecipID: text(),
    Party: text(),
    Otherid: text(),
    RecipCode: text(),
    RecipPrimcode: text(),
    Amend: text(),
    Report: text(),
    Microfilm: text(),
    Type: text(),
    RealCode: text(),
    Source: text(),
  },
  (table) => [primaryKey({ columns: [table.Cycle, table.FECRecNo] })]
);
