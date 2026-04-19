import { FaWhatsapp } from 'react-icons/fa';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSession } from '@/hooks/useSession';

interface FloatingWhatsAppProps {
    message?: string;
    tooltip?: string;
}

export function FloatingWhatsApp({
    message = 'Hola, me interesa saber más sobre las clases en línea y los eBooks de AlanMath.',
    tooltip = 'Clases y eBooks'
}: FloatingWhatsAppProps) {
    const { session } = useSession();

    // Only show for authenticated users (same behavior as FloatingChat)
    if (!session) return null;

    const phoneNumber = '573208056799';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <div
                                className="flex items-center justify-center h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg transition-transform hover:scale-110"
                            >
                                <FaWhatsapp className="h-8 w-8 text-white" />
                            </div>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
