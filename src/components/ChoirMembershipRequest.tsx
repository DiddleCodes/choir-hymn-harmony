import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Music, Users } from "lucide-react";

interface ChoirMembershipRequestProps {
  onClose: () => void;
}

const ChoirMembershipRequest = ({ onClose }: ChoirMembershipRequestProps) => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { requestChoirMembership } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await requestChoirMembership(
      formData.email,
      formData.fullName,
      formData.password
    );
    
    if (!error) {
      onClose();
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto mobile-scale-in mobile-card-hover">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mobile-bounce-in">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="flex items-center gap-2 justify-center mobile-fade-in">
          <Music className="w-5 h-5" />
          Join Our Choir
        </CardTitle>
        <CardDescription className="mobile-fade-in">
          Request access to songs and become a choir member. An admin will review your request.
        </CardDescription>
      </CardHeader>
      <CardContent className="mobile-slide-up">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
              className="mobile-transition mobile-button-press"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
              className="mobile-transition mobile-button-press"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Create a password"
              className="mobile-transition mobile-button-press"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 mobile-button-press mobile-transition"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 mobile-button-press mobile-transition"
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChoirMembershipRequest;