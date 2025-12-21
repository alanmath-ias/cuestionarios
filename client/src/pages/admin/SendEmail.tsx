import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send } from 'lucide-react';

const SendEmail: React.FC = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Error al enviar el correo');
            }

            toast({
                title: "Correo enviado",
                description: `Se ha enviado el correo a ${formData.to} exitosamente.`,
                variant: "default",
            });

            // Limpiar formulario
            setFormData({ to: '', subject: '', message: '' });

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudo enviar el correo. Revisa la consola o intenta más tarde.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card className="shadow-md">
                <CardHeader className="bg-primary/5 border-b pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                        <Mail className="w-6 h-6" />
                        Enviar Correo
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="to" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Para:
                            </label>
                            <Input
                                id="to"
                                name="to"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={formData.to}
                                onChange={handleChange}
                                required
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Asunto:
                            </label>
                            <Input
                                id="subject"
                                name="subject"
                                type="text"
                                placeholder="Asunto del correo"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Mensaje:
                            </label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Escribe tu mensaje aquí..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="min-h-[200px] bg-white resize-y"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading} className="w-full md:w-auto min-w-[150px]">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Enviando...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Send className="w-4 h-4" />
                                        Enviar Correo
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SendEmail;
