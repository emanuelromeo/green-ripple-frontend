import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Leaf, Edit, Trash2, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectCardProps {
  id: number;
  name: string;
  description: string;
  requiredVotes: number;
  receivedVotes: number;
  hasVoted: boolean;
  onVote: (projectId: number) => void;
  onUpdate?: (
    projectId: number,
    updatedData: { name: string; description: string; requiredVotes: number },
  ) => void;
  onDelete?: (projectId: number) => void;
  isAdmin?: boolean;
}

const ProjectCard = ({
  id = 1,
  name = "Sustainable Urban Garden",
  description = "Creating community gardens in urban areas to promote sustainable food production and community engagement.",
  requiredVotes = 100,
  receivedVotes = 45,
  hasVoted = false,
  onVote = () => {},
  onUpdate = () => {},
  onDelete = () => {},
  isAdmin = false,
}: ProjectCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedRequiredVotes, setEditedRequiredVotes] = useState(requiredVotes);

  const progress = Math.min(
    Math.round((receivedVotes / requiredVotes) * 100),
    100,
  );

  const handleEditSubmit = () => {
    onUpdate(id, {
      name: editedName,
      description: editedDescription,
      requiredVotes: editedRequiredVotes,
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="w-full max-w-sm h-full flex flex-col bg-white shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-green-800">
              {name}
            </CardTitle>
            <div className="flex gap-2">
              {hasVoted && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Voted
                </Badge>
              )}
              {isAdmin && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-700"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <CardDescription className="text-sm text-gray-600 line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="mt-2 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{receivedVotes} votes</span>
                <span>Goal: {requiredVotes}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            onClick={() => onVote(id)}
            disabled={hasVoted}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            variant={hasVoted ? "outline" : "default"}
          >
            <Leaf className="mr-2 h-4 w-4" />
            {hasVoted ? "Already Voted" : "Vote for Project"}
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to the project details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requiredVotes" className="text-right">
                Required Votes
              </Label>
              <Input
                id="requiredVotes"
                type="number"
                value={editedRequiredVotes}
                onChange={(e) => setEditedRequiredVotes(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectCard;
