
export interface CreatorShort {
  id: string,
  userId: string,
  avatar: string,
  name: number,  
  username: number,  
  verified : boolean,
}

export interface Creator extends CreatorShort{
  email: string
  link: string
  background: string,
  tags: string,
  bio: Text,
}