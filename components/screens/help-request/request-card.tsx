import { Dispatch, SetStateAction, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { THelpRequest } from "@/types";
import { IUser } from "@/models/User";

interface RequestCardProps {
  request: THelpRequest; // replace with your Request type
  user: IUser; // replace with your User type
  updateStatus: (id: string, status: string) => void;
  addResponse: (id: string, message: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  getPriorityColor: (priority: string) => string;
  response: string;
  setResponse: Dispatch<SetStateAction<string>>;
}

export default function RequestCard({
  request,
  user,
  updateStatus,
  addResponse,
  getStatusColor,
  getStatusIcon,
  getPriorityColor,
  response,
  setResponse,
}: RequestCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      key={request._id}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          {/* LEFT SIDE */}
          <div className="flex-1">
            {/* Title + badges */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold">{request.subject}</h3>
              <Badge className={getStatusColor(request.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(request.status)}
                  {request.status.replace("_", " ")}
                </div>
              </Badge>
              <Badge className={getPriorityColor(request.priority)}>
                {request.priority}
              </Badge>
              <Badge variant="outline">{request.category}</Badge>
            </div>

            {/* Message preview */}
            <p className="text-gray-600 mb-3 line-clamp-2">{request.message}</p>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                From: {request.fromUserId.name} ({request.fromUserId.role})
              </span>
              {request.toUserId && (
                <span>
                  To: {request.toUserId.name} ({request.toUserId.role})
                </span>
              )}
              <span>•</span>
              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{request.responses.length} responses</span>
            </div>
          </div>

          {/* RIGHT SIDE (controls + dialog) */}
          <div className="flex items-center gap-2 ml-4">
            {user &&
              (user?.role === "admin" ||
                request.toUserId?._id.toString() === user._id) &&
              request.status !== "resolved" &&
              request.status !== "closed" && (
                <Select
                  value={request.status}
                  onValueChange={(value) => updateStatus(request._id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              )}

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(true)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {request.subject}
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace("_", " ")}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Request #{request._id.slice(-8)} • {request.category}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Original message */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">
                        {request.fromUserId.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{request.message}</p>
                  </div>

                  {/* Responses */}
                  {request.responses.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Responses</h4>
                      {request.responses.map((resp: any, index: number) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {resp.userId.name}
                              </span>
                              {resp.isAdmin && (
                                <Badge variant="default" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(resp.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{resp.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Response */}
                  {request.status !== "closed" &&
                    request.status !== "resolved" && (
                      <div className="space-y-2">
                        <Label htmlFor="response">Add Response</Label>
                        <Textarea
                          id="response"
                          placeholder="Type your response..."
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          rows={3}
                        />
                        <Button
                          onClick={() => {
                            addResponse(request._id, response);
                            setResponse("");
                          }}
                          disabled={!response.trim()}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Response
                        </Button>
                      </div>
                    )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
