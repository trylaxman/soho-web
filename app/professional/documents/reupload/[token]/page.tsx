import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfessionalDocumentReuploadForm from "@/components/professional/ProfessionalDocumentReuploadForm";

export default async function ProfessionalDocumentReuploadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const professional = await prisma.professionalProfile.findFirst({
    where: {
      idDocumentReuploadToken: token,
      idDocumentReuploadExpiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      idDocumentType: true,
    },
  });

  if (!professional) {
    notFound();
  }

  return (
    <ProfessionalDocumentReuploadForm
      token={token}
      professionalName={professional.fullName}
      currentDocumentType={professional.idDocumentType}
    />
  );
}