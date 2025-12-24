import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

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
        <div className="min-h-screen bg-slate-950 p-8 text-slate-200">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin">
                        <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white hover:bg-white/5">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al Panel
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-100">Enviar Correo</h1>
                    <p className="text-slate-400">Envía notificaciones o mensajes directos a los usuarios.</p>
                </div>

                <Card className="shadow-2xl border border-white/10 bg-slate-900">
                    <CardHeader className="bg-slate-900/50 border-b border-white/5 pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-400">
                            <Mail className="w-5 h-5" />
                            Redactar Mensaje
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="to" className="text-sm font-medium leading-none text-slate-400">
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
                                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-blue-500/50 placeholder:text-slate-600 focus:border-blue-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium leading-none text-slate-400">
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
                                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-blue-500/50 placeholder:text-slate-600 focus:border-blue-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium leading-none text-slate-400">
                                    Mensaje:
                                </label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Escribe tu mensaje aquí..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="min-h-[200px] bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-blue-500/50 placeholder:text-slate-600 resize-y focus:border-blue-500/50"
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/5">
                                <Button type="submit" disabled={loading} className="w-full md:w-auto min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
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
        </div>
    );
};

export default SendEmail;
