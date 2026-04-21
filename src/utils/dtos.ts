export interface RegisterFormDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormDto {
  email: string;
  password: string;
}

export interface SaveRecipeDto {
  title: string;
  ingredients: string[];
  steps: string[];
}

export interface UpdateRecipeDto {
  title?: string;
  ingredients?: string;
  steps?: string;
}