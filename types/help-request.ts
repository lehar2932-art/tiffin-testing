export interface THelpRequest {
  _id: string;
  fromUserId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  toUserId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  responses: Array<{
    userId: {
      name: string;
      role: string;
    };
    message: string;
    timestamp: string;
    isAdmin: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}
