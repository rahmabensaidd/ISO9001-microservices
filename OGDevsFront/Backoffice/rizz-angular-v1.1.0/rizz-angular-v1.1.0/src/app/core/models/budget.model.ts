export interface BudgetRequest {
  description: string;
  duration: number;
}

export interface BudgetResponse {
  project_type: string;
  predicted_budget: number;
  rule_based_budget: number;
  salary_cost: number;
  material_cost: number;
  salary_breakdown: { [key: string]: string };
  material_breakdown: { [key: string]: string };

}
