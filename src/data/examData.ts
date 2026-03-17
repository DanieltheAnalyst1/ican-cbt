export interface SubQuestion {
  id: string;
  label: string;
  text: string;
  marks: number;
  modelAnswer: string;
  hints: string[];
  keyPoints: string[];
}

export interface FinancialTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface ExamQuestion {
  id: number;
  title: string;
  scenario: string;
  financialTable?: FinancialTable;
  financialTables?: FinancialTable[];
  images?: { src: string; alt: string; caption?: string }[];
  required: string;
  subQuestions: SubQuestion[];
  totalMarks: number;
  sectionId?: string;
}

export interface ExamSection {
  id: string;
  label: string;
  instructions: string;
  totalQuestions: number;
  requiredQuestions: number;
  isCompulsory: boolean;
  sortOrder: number;
}

export interface Exam {
  id: string;
  subject: string;
  code: string;
  date: string;
  duration: number;
  totalMarks: number;
  gradient: string;
  icon: string;
  questions: ExamQuestion[];
  sections: ExamSection[];
  instructions: string[];
}

export const sampleExams: Exam[] = [
  {
    id: "aaa-2024",
    subject: "Advanced Audit and Assurance",
    code: "AAA",
    date: "November 2024",
    duration: 210,
    totalMarks: 100,
    gradient: "gradient-primary",
    icon: "🔍",
    sections: [],
    instructions: [
      "This paper consists of 7 questions totalling 100 marks.",
      "Attempt ALL questions.",
      "Show ALL workings clearly.",
      "Present your answers in a clear and logical manner.",
      "The use of a calculator is permitted.",
      "Time allowed: 3 hours 30 minutes.",
    ],
    questions: [
      {
        id: 1,
        title: "Question 1 — Engagement Planning",
        scenario:
          "Celestial Manufacturing Plc is a publicly listed company that manufactures electronic components. The company has experienced rapid growth over the past three years, expanding its operations to include three new production facilities. During the year ended December 31, 2023, the company reported revenue of ₦15.8 billion (2022: ₦11.2 billion) and profit before tax of ₦2.1 billion (2022: ₦1.8 billion). Your firm, ABC & Co (Chartered Accountants), has been appointed as the external auditors for the first time.",
        financialTable: {
          title: "Extract from Statement of Financial Position as at December 31, 2023",
          headers: ["Item", "2023 (₦'000)", "2022 (₦'000)"],
          rows: [
            ["Property, Plant & Equipment", "8,450,000", "5,200,000"],
            ["Inventory", "3,200,000", "2,100,000"],
            ["Trade Receivables", "2,800,000", "1,950,000"],
            ["Cash and Bank", "450,000", "820,000"],
            ["Total Assets", "14,900,000", "10,070,000"],
            ["Trade Payables", "2,300,000", "1,600,000"],
            ["Bank Loans", "4,500,000", "2,000,000"],
            ["Share Capital", "3,000,000", "3,000,000"],
            ["Retained Earnings", "5,100,000", "3,470,000"],
          ],
        },
        required: "You are the audit engagement partner responsible for planning the audit.",
        subQuestions: [
          {
            id: "1a", label: "a",
            text: "Identify and explain FIVE key audit risks associated with the audit of Celestial Manufacturing Plc.",
            marks: 10,
            modelAnswer: "1. Rapid revenue growth (41% increase) — risk of overstated revenue through premature recognition or fictitious sales. 2. Significant increase in PPE (62%) — risk of improper capitalization of expenses or incorrect valuation of new facilities. 3. Inventory growth (52%) — risk of obsolescence or overvaluation, especially with new production lines. 4. Increased bank borrowings (125%) — going concern risk given declining cash position and high leverage. 5. First-year audit engagement — inherent risk due to lack of prior audit knowledge, potential for undetected misstatements from prior periods.",
            hints: ["Use the financial data to calculate percentage changes — examiners want to see quantified risks.", "Structure each risk as: identify → explain impact on financial statements → link to assertion."],
            keyPoints: ["Revenue recognition risk", "PPE capitalization vs expense", "Inventory valuation", "Going concern / liquidity", "New engagement risk"],
          },
          {
            id: "1b", label: "b",
            text: "Describe the preliminary engagement activities that should be performed before accepting this new audit engagement.",
            marks: 5,
            modelAnswer: "Preliminary activities include: 1. Client acceptance procedures — assess integrity of management, identify potential conflicts of interest. 2. Communication with previous auditors — obtain permission from client, inquire about reasons for change and any disagreements. 3. Competence assessment — ensure the firm has adequate resources, expertise in manufacturing sector. 4. Independence evaluation — check for any relationships that could compromise independence. 5. Engagement letter — agree on terms, scope, responsibilities, and fee arrangements per ISA 210.",
            hints: ["Follow the ISA 220/300 framework for preliminary engagement activities.", "Don't forget the ethical requirements under IESBA Code."],
            keyPoints: ["Client acceptance", "Previous auditor communication", "Competence and resources", "Independence", "Engagement letter"],
          },
          {
            id: "1c", label: "c",
            text: "Outline the key elements of the overall audit strategy for this engagement.",
            marks: 5,
            modelAnswer: "Key elements: 1. Scope — determine reporting framework (IFRS), identify significant components, plan for group considerations. 2. Reporting objectives — set materiality levels (suggest 5% of PBT = ₦105m). 3. Timing — plan interim and final audit visits around year-end. 4. Direction — allocate experienced team members to high-risk areas (revenue, PPE, inventory). 5. Resources — consider need for specialists (valuers for PPE, IT specialists for systems). 6. Risk assessment — preliminary analytical procedures to identify areas of focus.",
            hints: ["Think of audit strategy as the 'big picture' plan — scope, timing, direction.", "Materiality calculation is easy marks — always include it."],
            keyPoints: ["Scope and reporting framework", "Materiality levels", "Timing of procedures", "Team allocation", "Specialist involvement"],
          },
        ],
        totalMarks: 20,
      },
      {
        id: 2,
        title: "Question 2 — Internal Controls",
        scenario:
          "Meridian Bank Plc operates a nationwide network of 250 branches. The bank has recently implemented a new core banking system to replace its legacy system. During the transition period, several control weaknesses were identified by the internal audit department. The bank processes an average of 500,000 transactions daily with a total value exceeding ₦50 billion.",
        required: "As the external auditor of Meridian Bank Plc:",
        subQuestions: [
          {
            id: "2a", label: "a",
            text: "Evaluate FOUR risks associated with the migration to the new core banking system and their potential impact on the financial statements.",
            marks: 8,
            modelAnswer: "1. Data migration errors — incomplete or inaccurate transfer of account balances could misstate assets/liabilities. 2. Parallel running failures — if old and new systems produce different results, reliability of financial data is compromised. 3. Access control weaknesses — during transition, temporary elevated access rights may allow unauthorized transactions. 4. Processing interruptions — system downtime could result in unrecorded transactions affecting completeness of financial records.",
            hints: ["For each risk, clearly state the IT risk and its financial statement impact.", "Use the COSO framework or IT general controls as your mental model."],
            keyPoints: ["Data integrity during migration", "Parallel running", "Access controls", "Transaction completeness"],
          },
          {
            id: "2b", label: "b",
            text: "Recommend appropriate audit procedures to address each risk identified above.",
            marks: 7,
            modelAnswer: "1. For data migration — reconcile key account balances between legacy and new system; test sample of migrated records. 2. For parallel running — compare outputs of both systems for a sample period; investigate discrepancies. 3. For access controls — review user access logs during transition; test segregation of duties in new system. 4. For processing completeness — perform sequence checks on transaction numbers; reconcile daily transaction totals during transition period.",
            hints: ["Match each procedure directly to a risk — one-to-one mapping scores highest.", "Include both tests of controls and substantive procedures where relevant."],
            keyPoints: ["Balance reconciliation", "System output comparison", "Access log review", "Sequence and completeness checks"],
          },
        ],
        totalMarks: 15,
      },
      {
        id: 3,
        title: "Question 3 — Group Audits",
        scenario:
          "Pinnacle Holdings Plc is a diversified conglomerate with subsidiaries in manufacturing, real estate, and financial services. The group has 12 subsidiaries, of which 8 are significant components. Three subsidiaries are audited by other firms in different jurisdictions (Ghana, Kenya, and South Africa).",
        required: "You are the group engagement partner:",
        subQuestions: [
          {
            id: "3a", label: "a",
            text: "Explain the responsibilities of the group engagement partner in accordance with ISA 600.",
            marks: 5,
            modelAnswer: "The group engagement partner is responsible for: 1. Overall direction, supervision, and performance of the group audit. 2. Ensuring the audit opinion on the group financial statements is appropriate. 3. Evaluating the competence and independence of component auditors. 4. Determining the type of work to be performed on components (full audit, specified procedures, or analytical review). 5. Communicating clearly with component auditors about scope, timing, and findings.",
            hints: ["ISA 600 is the key standard — reference it explicitly.", "Focus on oversight and communication responsibilities."],
            keyPoints: ["Overall responsibility", "Component auditor evaluation", "Work type determination", "Communication requirements"],
          },
          {
            id: "3b", label: "b",
            text: "Describe the procedures to be performed regarding the work of component auditors.",
            marks: 5,
            modelAnswer: "Procedures include: 1. Assess independence and competence of component auditors. 2. Issue group audit instructions covering materiality, significant risks, and reporting deadlines. 3. Review component auditors' working papers and conclusions. 4. Evaluate whether sufficient appropriate evidence has been obtained. 5. Consider whether further procedures or site visits are necessary for significant components.",
            hints: ["Think of it as a quality control process over the component auditors' work.", "Emphasize the group audit instructions as a key communication tool."],
            keyPoints: ["Independence assessment", "Group instructions", "Working paper review", "Evidence evaluation", "Site visits"],
          },
          {
            id: "3c", label: "c",
            text: "Discuss the implications of material subsidiaries being audited by firms in different jurisdictions.",
            marks: 5,
            modelAnswer: "Implications include: 1. Different auditing and accounting standards may apply — need to assess equivalence. 2. Regulatory and legal differences may affect the scope of audit work. 3. Language barriers and cultural differences may affect communication quality. 4. Different ethical requirements may exist — need to verify independence standards are adequate. 5. Time zone differences may complicate coordination and timing of procedures.",
            hints: ["Consider practical, regulatory, and quality dimensions of cross-border work.", "Mention the need for reconciliation to the group's reporting framework (IFRS)."],
            keyPoints: ["Standards differences", "Regulatory environment", "Communication challenges", "Ethical requirements", "Coordination logistics"],
          },
        ],
        totalMarks: 15,
      },
      {
        id: 4,
        title: "Question 4 — Professional Ethics",
        scenario:
          "Your audit firm, XYZ Partners, has been auditing Omega Pharmaceuticals Ltd for the past 7 years. The engagement partner's son has recently been appointed as the Financial Controller of Omega Pharmaceuticals. Additionally, Omega has offered your firm a contract to implement a new ERP system worth ₦200 million. The audit fee for the current year is ₦45 million.",
        required: "Required:",
        subQuestions: [
          {
            id: "4a", label: "a",
            text: "Identify and evaluate ALL ethical threats arising from the scenario above.",
            marks: 6,
            modelAnswer: "Threats identified: 1. Familiarity threat — 7-year audit tenure creates close relationship with management. 2. Self-interest / intimidation threat — partner's son as Financial Controller creates direct family interest. 3. Self-review threat — implementing ERP system and then auditing data from it. 4. Self-interest threat — ERP contract (₦200m) is significantly larger than audit fee (₦45m), creating fee dependency. 5. Advocacy threat — potential pressure to give favorable opinion to retain lucrative consultancy work.",
            hints: ["Systematically go through the IESBA threat categories: self-interest, self-review, advocacy, familiarity, intimidation.", "Quantify the fee dependency — ₦200m vs ₦45m is a red flag."],
            keyPoints: ["Familiarity (long tenure)", "Family interest (partner's son)", "Self-review (ERP implementation)", "Fee dependency", "Multiple simultaneous threats"],
          },
          {
            id: "4b", label: "b",
            text: "Recommend appropriate safeguards for each threat identified.",
            marks: 4,
            modelAnswer: "Safeguards: 1. Familiarity — rotate the engagement partner (mandatory after 7 years per ethical standards). 2. Family interest — remove the engagement partner from the engagement entirely; consider resignation from the audit. 3. Self-review — decline the ERP contract or arrange for the ERP work to be done by a completely separate team with no involvement in the audit. 4. Fee dependency — assess whether total fees from Omega exceed 15% of firm revenue; if so, decline additional services.",
            hints: ["Safeguards should be proportionate to the severity of each threat.", "For the family relationship, consider if any safeguard is actually sufficient — sometimes resignation is the only answer."],
            keyPoints: ["Partner rotation", "Partner removal", "Separate teams or decline engagement", "Fee threshold assessment"],
          },
          {
            id: "4c", label: "c",
            text: "Advise on whether your firm should accept the ERP implementation contract. Justify your recommendation.",
            marks: 5,
            modelAnswer: "Recommendation: The firm should NOT accept the ERP implementation contract. Justification: 1. The self-review threat is severe and cannot be adequately mitigated — auditing financial data from a system the firm designed creates fundamental conflicts. 2. IESBA Code and local regulations prohibit providing certain non-audit services to audit clients, especially those involving management functions. 3. The fee size (₦200m vs ₦45m audit fee) creates unacceptable economic dependence. 4. Combined with the existing familiarity and family threats, accepting would represent an unacceptable accumulation of threats to independence.",
            hints: ["Be decisive — the examiner wants a clear 'accept' or 'decline' with structured reasoning.", "Reference the IESBA prohibition on management functions for audit clients."],
            keyPoints: ["Clear recommendation to decline", "Self-review prohibition", "Management function restriction", "Fee dependency concerns", "Cumulative threat assessment"],
          },
        ],
        totalMarks: 15,
      },
      {
        id: 5,
        title: "Question 5 — Audit Evidence",
        scenario:
          "You are conducting the audit of Harmony Construction Ltd, a company specializing in large infrastructure projects. The company has three major contracts in progress: a highway construction (₦8.5 billion), a bridge project (₦3.2 billion), and a housing estate development (₦5.7 billion). Revenue is recognized using the percentage of completion method.",
        financialTable: {
          title: "Contract Status Summary",
          headers: ["Contract", "Total Value (₦'B)", "% Complete", "Revenue Recognized (₦'B)", "Costs to Date (₦'B)"],
          rows: [
            ["Highway", "8.5", "65%", "5.525", "4.800"],
            ["Bridge", "3.2", "40%", "1.280", "1.500"],
            ["Housing", "5.7", "80%", "4.560", "4.100"],
          ],
        },
        required: "As the engagement partner:",
        subQuestions: [
          {
            id: "5a", label: "a",
            text: "Design substantive audit procedures for verifying the percentage of completion and revenue recognized for each contract.",
            marks: 8,
            modelAnswer: "Procedures: 1. Inspect contracts to verify total contract values and payment terms. 2. Obtain and review quantity surveyor reports to independently verify percentage of completion. 3. Recalculate revenue recognized using the formula: Total Contract Value × % Complete. 4. Vouch costs to date to supporting documentation (invoices, sub-contractor certificates). 5. Perform site visits to physically verify stage of completion for significant contracts. 6. Compare management's estimated costs to complete with historical accuracy of prior estimates. 7. Inspect contract variation orders and assess their impact on total contract value. 8. Review post year-end progress to confirm year-end estimates were reasonable.",
            hints: ["Cover the full evidence spectrum: inspection, observation, recalculation, inquiry, confirmation.", "Site visits are particularly important for construction audits — always mention them."],
            keyPoints: ["Contract inspection", "Independent verification (QS reports)", "Revenue recalculation", "Cost vouching", "Site visits", "Estimate evaluation"],
          },
          {
            id: "5b", label: "b",
            text: "Identify any indicators of potential loss-making contracts and explain the audit implications.",
            marks: 7,
            modelAnswer: "The Bridge project shows indicators of a potential loss: costs to date (₦1.5B) exceed revenue recognized (₦1.28B) at only 40% completion. Projected total cost: ₦1.5B / 0.4 = ₦3.75B vs contract value of ₦3.2B, indicating a potential loss of ₦550M. Audit implications: 1. Under IAS 11/IFRS 15, expected losses must be recognized immediately in full. 2. Need to assess if management has made adequate provision for the anticipated loss. 3. Evaluate reliability of cost estimates — are cost overruns due to specific issues or systemic problems? 4. Consider impact on going concern if losses are material. 5. If provision is not made, this represents a potential material misstatement requiring modification of the audit opinion.",
            hints: ["Calculate projected total cost = costs to date ÷ % complete — compare with contract value.", "The Bridge project is the obvious loss-maker — show the calculation clearly."],
            keyPoints: ["Bridge project loss identification", "Projected loss calculation", "IAS 11 immediate recognition requirement", "Provision adequacy", "Audit opinion implications"],
          },
        ],
        totalMarks: 15,
      },
      {
        id: 6,
        title: "Question 6 — Audit Reporting",
        scenario:
          "During the audit of GlobalTech Solutions Ltd for the year ended September 30, 2023, you discovered that the company failed to disclose a contingent liability of ₦2.5 billion relating to a pending lawsuit. Management has refused to include this disclosure, stating that it would negatively impact the company's share price. Additionally, you were unable to attend the physical inventory count due to late appointment.",
        required: "Required:",
        subQuestions: [
          {
            id: "6a", label: "a",
            text: "Discuss the impact of each matter on the auditor's report.",
            marks: 5,
            modelAnswer: "Matter 1 — Non-disclosure of contingent liability: This is a material departure from IFRS (IAS 37). Since management has deliberately refused to disclose, and the amount (₦2.5B) is likely material, this warrants a qualified or adverse opinion depending on pervasiveness. The misstatement is in disclosure, not recognition. Matter 2 — Inability to attend inventory count: This is a limitation on scope. The auditor was unable to obtain sufficient appropriate evidence regarding inventory. If alternative procedures cannot provide adequate evidence, this constitutes a scope limitation warranting a qualified or disclaimer of opinion.",
            hints: ["Classify each issue: is it a misstatement or a scope limitation? This determines the type of modification.", "Consider materiality and pervasiveness to determine qualified vs adverse/disclaimer."],
            keyPoints: ["Contingent liability = material misstatement (disagreement)", "Inventory = scope limitation", "Qualified vs adverse/disclaimer assessment", "ISA 705 framework"],
          },
          {
            id: "6b", label: "b",
            text: "Draft the appropriate modifications to the auditor's report, including the basis for modification paragraph.",
            marks: 5,
            modelAnswer: "Modified Auditor's Report: Opinion — Qualified Opinion. Basis for Qualified Opinion: 1. The company has a pending lawsuit with a potential exposure of ₦2.5 billion. Under IAS 37 Provisions, Contingent Liabilities and Contingent Assets, this matter should be disclosed in the notes to the financial statements. Management has declined to make this disclosure. 2. We were appointed as auditors after the date of the physical inventory count on [date] and were unable to observe the counting of physical inventories. We were unable to satisfy ourselves by alternative means concerning inventory quantities held at year-end with a carrying amount of ₦[X]. Due to the matters described above, we are unable to determine whether adjustments might be necessary to the financial statements.",
            hints: ["Use the exact ISA 705/706 language and structure for the modification paragraphs.", "Separate each matter into its own paragraph for clarity."],
            keyPoints: ["Qualified opinion (both material but not pervasive)", "Separate basis paragraphs", "IAS 37 reference for contingent liability", "Alternative procedures consideration for inventory"],
          },
        ],
        totalMarks: 10,
      },
      {
        id: 7,
        title: "Question 7 — Quality Control",
        scenario:
          "Your firm recently underwent an ICAN practice review. The review team identified several deficiencies including: inadequate documentation of audit planning, insufficient involvement of the engagement quality control reviewer, lack of formal training programs for audit staff, and absence of a system for monitoring compliance with ethical requirements.",
        required: "Required:",
        subQuestions: [
          {
            id: "7a", label: "a",
            text: "For EACH deficiency identified, explain its significance and recommend corrective actions in accordance with ISQC 1.",
            marks: 8,
            modelAnswer: "1. Inadequate planning documentation — Significance: Without proper documentation, audit quality cannot be demonstrated; increases risk of insufficient work in high-risk areas. Corrective action: Implement standardized planning templates and checklists; require partner sign-off on all audit plans. 2. Insufficient EQCR involvement — Significance: EQCR is a critical safeguard for listed entities and high-risk engagements; absence undermines audit quality. Corrective action: Appoint qualified EQCRs for all applicable engagements; define involvement at key stages (planning, fieldwork completion, opinion). 3. No formal training — Significance: Staff may lack current technical knowledge, increasing risk of errors. Corrective action: Establish mandatory CPD program; conduct annual technical updates on standards changes. 4. No ethical compliance monitoring — Significance: Independence breaches may go undetected, threatening firm's reputation and regulatory standing. Corrective action: Implement annual independence declarations; establish ethics partner role; create conflict checking procedures.",
            hints: ["For each deficiency, follow the pattern: Significance → Corrective Action.", "Reference ISQC 1 elements: Leadership, Ethics, Acceptance, HR, Engagement Performance, Monitoring."],
            keyPoints: ["Documentation standards", "EQCR appointment and involvement", "CPD and training programs", "Independence monitoring system"],
          },
          {
            id: "7b", label: "b",
            text: "Describe the elements of a robust system of quality control for an audit firm.",
            marks: 2,
            modelAnswer: "Per ISQC 1, the six elements are: 1. Leadership responsibilities for quality within the firm. 2. Relevant ethical requirements including independence. 3. Acceptance and continuance of client relationships. 4. Human resources — recruitment, training, evaluation, compensation. 5. Engagement performance — supervision, review, consultation, differences of opinion. 6. Monitoring — ongoing assessment of quality control system effectiveness.",
            hints: ["Simply list the 6 ISQC 1 elements — this is a knowledge recall question.", "Each element only needs a brief description for 2 marks."],
            keyPoints: ["Leadership", "Ethics", "Client acceptance", "Human resources", "Engagement performance", "Monitoring"],
          },
        ],
        totalMarks: 10,
      },
    ],
  },
  {
    id: "tax-2024",
    subject: "Advanced Taxation",
    code: "AT",
    date: "November 2024",
    duration: 210,
    totalMarks: 100,
    gradient: "gradient-orange",
    icon: "💰",
    sections: [],
    instructions: ["This is a sample exam placeholder."],
    questions: [],
  },
  {
    id: "fa-2024",
    subject: "Financial Accounting",
    code: "FA",
    date: "November 2024",
    duration: 180,
    totalMarks: 100,
    gradient: "gradient-teal",
    icon: "📊",
    sections: [],
    instructions: [
      "This paper consists of 7 questions totalling 100 marks.",
      "Attempt ALL questions.",
      "Show ALL workings clearly.",
      "Present your answers in a clear and logical manner.",
      "The use of a calculator is permitted.",
      "Time allowed: 3 hours.",
    ],
    questions: [
      {
        id: 1,
        title: "Question 1 — Investment Appraisal & NPV Analysis",
        scenario:
          "Zenith Industries Ltd is evaluating a new manufacturing plant. The project requires an initial investment of **₦500 million** and is expected to generate cash flows over 5 years. The company's cost of capital is **12%**.\n\nThe **Net Present Value (NPV)** should be calculated using:\n\n$$NPV = \\sum_{t=1}^{n} \\frac{CF_t}{(1+r)^t} - C_0$$\n\nWhere:\n- $CF_t$ = Cash flow at time $t$\n- $r$ = Discount rate (12%)\n- $C_0$ = Initial investment\n- $n$ = Project life (5 years)\n\nAdditionally, compute the **Internal Rate of Return (IRR)** where $NPV = 0$, and the **Payback Period**.",
        financialTable: {
          title: "Projected Cash Flows (₦'000)",
          headers: ["Year", "Revenue", "Operating Costs", "Net Cash Flow", "PV Factor @12%", "Present Value"],
          rows: [
            ["0", "—", "—", "(500,000)", "1.000", "(500,000)"],
            ["1", "200,000", "(80,000)", "120,000", "0.893", "107,160"],
            ["2", "250,000", "(90,000)", "160,000", "0.797", "127,520"],
            ["3", "300,000", "(100,000)", "200,000", "0.712", "142,400"],
            ["4", "280,000", "(95,000)", "185,000", "0.636", "117,660"],
            ["5", "260,000", "(90,000)", "170,000", "0.567", "96,390"],
          ],
        },
        financialTables: [
          {
            title: "Sensitivity Analysis — NPV at Different Discount Rates",
            headers: ["Discount Rate", "NPV (₦'000)", "Decision"],
            rows: [
              ["8%", "152,340", "Accept"],
              ["10%", "112,450", "Accept"],
              ["12%", "91,130", "Accept"],
              ["15%", "42,680", "Accept"],
              ["18%", "(8,920)", "Reject"],
              ["20%", "(38,560)", "Reject"],
            ],
          },
        ],
        required: "You are the **Financial Controller** responsible for presenting the investment appraisal to the board.\n\nCalculate the NPV, IRR, and Payback Period. Provide a recommendation using the formula $NPV > 0 \\Rightarrow \\text{Accept}$.",
        subQuestions: [
          {
            id: "fa-1a",
            label: "a",
            text: "Calculate the **Net Present Value (NPV)** of the project using a discount rate of 12%. Show all workings.\n\nUse the formula: $PV = \\frac{CF}{(1+r)^t}$ for each year.",
            marks: 10,
            modelAnswer: "**NPV Calculation at 12% discount rate:**\n\n| Year | Net Cash Flow (₦'000) | PV Factor @12% | Present Value (₦'000) |\n|------|----------------------|----------------|----------------------|\n| 0 | (500,000) | 1.000 | (500,000) |\n| 1 | 120,000 | 0.893 | 107,160 |\n| 2 | 160,000 | 0.797 | 127,520 |\n| 3 | 200,000 | 0.712 | 142,400 |\n| 4 | 185,000 | 0.636 | 117,660 |\n| 5 | 170,000 | 0.567 | 96,390 |\n\n$$NPV = 107,160 + 127,520 + 142,400 + 117,660 + 96,390 - 500,000 = ₦91,130$$\n\nSince $NPV > 0$, the project should be **accepted**.",
            hints: ["Set up a clear table format — examiners award marks for structured workings.", "Remember to show the PV factor calculation: $PV = (1+0.12)^{-t}$"],
            keyPoints: ["Correct PV factors", "Accurate cash flow identification", "NPV positive conclusion", "Clear recommendation"],
          },
          {
            id: "fa-1b",
            label: "b",
            text: "Estimate the **Internal Rate of Return (IRR)** using interpolation. The IRR is the rate $r$ where:\n\n$$\\sum_{t=1}^{n} \\frac{CF_t}{(1+r)^t} = C_0$$",
            marks: 5,
            modelAnswer: "**IRR by interpolation:**\n\nFrom the sensitivity analysis:\n- At 15%: NPV = ₦42,680 (positive)\n- At 18%: NPV = (₦8,920) (negative)\n\nUsing interpolation formula:\n\n$$IRR = r_1 + \\frac{NPV_1}{NPV_1 - NPV_2} \\times (r_2 - r_1)$$\n\n$$IRR = 15\\% + \\frac{42,680}{42,680 + 8,920} \\times (18\\% - 15\\%)$$\n\n$$IRR = 15\\% + \\frac{42,680}{51,600} \\times 3\\% = 15\\% + 2.48\\% = **17.48\\%**$$\n\nSince IRR (17.48%) > Cost of capital (12%), the project is **viable**.",
            hints: ["Always pick one rate with positive NPV and one with negative NPV for interpolation.", "The interpolation formula is easy marks — memorize it."],
            keyPoints: ["Correct interpolation formula", "Appropriate rate selection", "Accurate calculation", "Comparison with cost of capital"],
          },
          {
            id: "fa-1c",
            label: "c",
            text: "Discuss **THREE limitations** of using NPV and IRR for investment decisions. Consider scenarios where $IRR_A > IRR_B$ but $NPV_A < NPV_B$.",
            marks: 5,
            modelAnswer: "**Limitations:**\n\n1. **Cash flow estimation uncertainty** — NPV relies on projected cash flows which may be inaccurate. Small changes in estimates can significantly alter the NPV result.\n\n2. **Mutually exclusive projects** — IRR can give conflicting rankings with NPV when projects differ in scale or timing. A project with higher IRR may have lower NPV (the *IRR paradox*).\n\n3. **Reinvestment assumption** — IRR assumes cash flows are reinvested at the IRR itself, which may be unrealistic. NPV's assumption of reinvestment at the cost of capital is generally more conservative.\n\n**Additional consideration:** Neither method accounts for qualitative factors such as strategic fit, environmental impact, or reputational risk.",
            hints: ["The IRR vs NPV conflict for mutually exclusive projects is a classic exam point.", "Always mention the reinvestment rate assumption difference."],
            keyPoints: ["Cash flow uncertainty", "IRR vs NPV conflict", "Reinvestment assumption", "Qualitative factors"],
          },
        ],
        totalMarks: 20,
      },
    ],
  },
  {
    id: "sfm-2024",
    subject: "Strategic Financial Management",
    code: "SFM",
    date: "November 2024",
    duration: 210,
    totalMarks: 100,
    gradient: "gradient-green",
    icon: "📈",
    sections: [],
    instructions: ["This is a sample exam placeholder."],
    questions: [],
  },
  {
    id: "cr-2024",
    subject: "Corporate Reporting",
    code: "CR",
    date: "November 2024",
    duration: 210,
    totalMarks: 100,
    gradient: "gradient-rose",
    icon: "📝",
    sections: [],
    instructions: ["This is a sample exam placeholder."],
    questions: [],
  },
  {
    id: "peg-2024",
    subject: "Public Sector Accounting & Finance",
    code: "PSAF",
    date: "November 2024",
    duration: 180,
    totalMarks: 100,
    gradient: "gradient-amber",
    icon: "🏛️",
    sections: [],
    instructions: ["This is a sample exam placeholder."],
    questions: [],
  },
];
