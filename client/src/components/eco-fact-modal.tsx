import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EcoFactModalProps {
  isOpen: boolean;
  onClose: () => void;
  fact: {
    title: string;
    description: string;
  };
}

export const EcoFactModal = ({ isOpen, onClose, fact }: EcoFactModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i className="fas fa-lightbulb text-2xl text-white"></i>
          </motion.div>
          <DialogTitle className="text-center text-xl font-bold">
            🌍 Did You Know?
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{fact.title}</h3>
          <p className="text-muted-foreground">{fact.description}</p>
          <Button onClick={onClose} className="w-full" data-testid="button-close-eco-fact">
            Continue Being a Planet Hero!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
