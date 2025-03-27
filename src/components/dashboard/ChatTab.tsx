
import React from "react";
import FinancialChat from "@/components/FinancialChat";

const ChatTab = () => {
  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="bg-white/10 p-1 sm:p-4 rounded-lg">
        <FinancialChat />
      </div>
    </div>
  );
};

export default ChatTab;
