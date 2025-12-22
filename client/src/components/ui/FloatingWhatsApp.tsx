import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function FloatingWhatsApp() {
    const phoneNumber = '573208056799';
    const message = encodeURIComponent('Hola, me interesa saber más sobre las clases en línea y los eBooks de AlanMath.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

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
                            <Button
                                size="icon"
                                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg transition-transform hover:scale-110"
                            >
                                <FaWhatsapp className="h-8 w-8 text-white" />
                            </Button>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Clases y eBooks</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
