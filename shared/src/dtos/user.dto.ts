export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CreateUserRequestDto {
  email: string;
  name: string;
}
