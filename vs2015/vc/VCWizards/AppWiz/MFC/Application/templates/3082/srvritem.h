[!if RIBBON_TOOLBAR]
// Este c�digo fuente de ejemplos de MFC muestra el uso de la interfaz de usuario Microsoft Office Fluent para MFC 
// ("interfaz de usuario Fluent") y solamente se proporciona como material de referencia para complementar la 
// documentaci�n de referencia de Microsoft Foundation Classes y la documentaci�n electr�nica relacionada 
// incluida con el software de la biblioteca de C++ de MFC.  
// Los t�rminos de licencia para copiar, usar o distribuir la interfaz de usuario Fluent est�n disponibles por separado.  
// Para obtener m�s informaci�n acerca del programa de licencia de la interfaz de usuario Fluent, visite 
// http://go.microsoft.com/fwlink/?LinkId=238214.
//
// (C) Microsoft Corporation
// Todos los derechos reservados.
[!endif]

// [!output SERVER_ITEM_HEADER]: interfaz de la clase [!output SERVER_ITEM_CLASS]
//

#pragma once

class [!output SERVER_ITEM_CLASS] : public [!output SERVER_ITEM_BASE_CLASS]
{
	DECLARE_DYNAMIC([!output SERVER_ITEM_CLASS])

// Constructores
public:
	[!output SERVER_ITEM_CLASS]([!output DOC_CLASS]* pContainerDoc);

// Atributos
	[!output DOC_CLASS]* GetDocument() const
		{ return reinterpret_cast<[!output DOC_CLASS]*>([!output SERVER_ITEM_BASE_CLASS]::GetDocument()); }

// Reemplazos
	public:
	virtual BOOL OnDraw(CDC* pDC, CSize& rSize);
	virtual BOOL OnGetExtent(DVASPECT dwDrawAspect, CSize& rSize);

// Implementaci�n
public:
	~[!output SERVER_ITEM_CLASS]();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:
	virtual void Serialize(CArchive& ar);   // Reemplazado para E/S del documento
};

