import { GetEmailById } from "./getEmailById";
import { GetLabels } from "./getLabels";
import { GetUnreadEmails } from "./getUnreadEmails";
import { ListEmails } from "./listEmails";
import { MarkAsRead } from "./markAsRead";
import { SearchEmails } from "./searchEmails";

export const googleGmailToolsList = [
	new GetEmailById(),
	new GetLabels(),
	new GetUnreadEmails(),
	new ListEmails(),
	new MarkAsRead(),
	new SearchEmails(),
];
