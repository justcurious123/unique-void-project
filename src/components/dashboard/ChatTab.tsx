
import React from "react";
import FinancialChat from "@/components/FinancialChat";
import UsageLimits from "@/components/dashboard/UsageLimits";

const ChatTab = () => {
  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Usage limits will only show when limits are reached */}
      <div className="mb-4">
        <UsageLimits alwaysShow={false} />
      </div>
      
      <div className="bg-white/10 p-1 sm:p-4 rounded-lg">
        <FinancialChat />
      </div>
    </div>
  );
};

export default ChatTab;
