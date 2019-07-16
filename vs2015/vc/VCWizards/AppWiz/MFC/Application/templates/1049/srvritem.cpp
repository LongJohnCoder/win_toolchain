[!if RIBBON_TOOLBAR]
// ���� �������� ��� MFC Samples ������������� ���������������� ����������������� ���������� Fluent �� ������ MFC � Microsoft Office
// ("Fluent UI") � ��������������� ������������� ��� ���������� �������� � �������� ���������� �
// ����������� �� ������ Microsoft Foundation Classes � ��������� ����������� ������������,
// ���������� � ����������� ����������� ���������� MFC C++.  
// ������� ������������� ���������� �� �����������, ������������� ��� ��������������� Fluent UI �������� ��������.  
// ��� ��������� �������������� �������� � ����� ������������ ��������� Fluent UI �������� ���-����
// http://go.microsoft.com/fwlink/?LinkId=238214.
//
// (C) ���������� ���������� (Microsoft Corp.)
// ��� ����� ��������.
[!endif]

// [!output SERVER_ITEM_IMPL] : ���������� ������ [!output SERVER_ITEM_CLASS]
//

#include "stdafx.h"
#include "[!output APP_HEADER]"

#include "[!output DOC_HEADER]"
#include "[!output SERVER_ITEM_HEADER]"
[!if CONTAINER_SERVER]
#include "[!output CONTAINER_ITEM_HEADER]"
[!endif]

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// ���������� [!output SERVER_ITEM_CLASS]

IMPLEMENT_DYNAMIC([!output SERVER_ITEM_CLASS], [!output SERVER_ITEM_BASE_CLASS])

[!output SERVER_ITEM_CLASS]::[!output SERVER_ITEM_CLASS]([!output DOC_CLASS]* pContainerDoc)
	: [!output SERVER_ITEM_BASE_CLASS](pContainerDoc, TRUE)
{
	// TODO: �������� ��� ��� ������������ ������ ������������
	//  (��������, ���������� �������������� �������� ��� ������ ������ � ��������� ������ ��������)
}

[!output SERVER_ITEM_CLASS]::~[!output SERVER_ITEM_CLASS]()
{
	// TODO: �������� ��� �������
}

void [!output SERVER_ITEM_CLASS]::Serialize(CArchive& ar)
{
	// [!output SERVER_ITEM_CLASS]::Serialize ���������� ������� ������, ����
	//  ������� ���������� � ����� ������.  ��� ����� ��������� �������������
	//  ����������� ��������� ������ OLE OnGetClipboardData.  ��� ����������� ��������
	//  �� ��������� ������������� ������ ������������ � ������� Serialize
	//  ���������.  � ������ ��������� ������ �������� ����������� �������������
	//  ��������� ����� ���������.

	if (!IsLinkedItem())
	{
		[!output DOC_CLASS]* pDoc = GetDocument();
		ASSERT_VALID(pDoc);
		if (pDoc)
			pDoc->Serialize(ar);
	}
}

BOOL [!output SERVER_ITEM_CLASS]::OnGetExtent(DVASPECT dwDrawAspect, CSize& rSize)
{
	// ����������� ����������, �������� ����� ��� ���, ������������ ������ ��������� ��������� �����������
	//  ��������.  ��� ��������� ������ ���������, ��������
	//  DVASPECT_THUMBNAIL (����� ���������� OnDrawEx) ���
	//  ���������� OnGetExtent ������ ���� �������� �� ���������
	//  �������������� ���������.

	if (dwDrawAspect != DVASPECT_CONTENT)
		return [!output SERVER_ITEM_BASE_CLASS]::OnGetExtent(dwDrawAspect, rSize);

	// [!output SERVER_ITEM_CLASS]::OnGetExtent ���������� ��� ��������� �������� �
	//  �������� HIMETRIC ������ ��������.  � ���������� �� ���������
	//  ������ ������������ ���������� ������.

	// TODO: �������� ���� ��������� ������

	rSize = CSize(3000, 3000);   // 3000 x 3000 HIMETRIC ������

	return TRUE;
}

BOOL [!output SERVER_ITEM_CLASS]::OnDraw(CDC* pDC, CSize& rSize)
{
	if (!pDC)
		return FALSE;

	// ������� ���� ���, ���� �� ����������� rSize
	UNREFERENCED_PARAMETER(rSize);

	// TODO: ������� ����� ����������� � ��������
	//  (�������� ������ ��������� � ��������, ������������ �� OnGetExtent)
	pDC->SetMapMode(MM_ANISOTROPIC);
	pDC->SetWindowOrg(0,0);
	pDC->SetWindowExt(3000, 3000);

	// TODO: �������� ��� ���������.  ����� ����, ��������� �������� HIMETRIC.
	//  ��� ������� ������������ � ��������� ���������� ��������� (pDC).

[!if CONTAINER_SERVER]
	// TODO: ����� ��������� ���������� ������� [!output CONTAINER_ITEM_CLASS].

[!endif]
[!if CONTAINER_SERVER]
	// ��������� ��� �������� ������ ������� � ��������� ���������.

	// TODO: ������� ���� ��� ����� ���������� ������ ���� ���������

	[!output DOC_CLASS]* pDoc = GetDocument();
	ASSERT_VALID(pDoc);
	if (!pDoc)
		return FALSE;

	POSITION pos = pDoc->GetStartPosition();
	[!output CONTAINER_ITEM_CLASS]* pItem = DYNAMIC_DOWNCAST([!output CONTAINER_ITEM_CLASS], pDoc->GetNextClientItem(pos));
	if (pItem != NULL)
		pItem->Draw(pDC, CRect(10, 10, 1010, 1010));
[!endif]
	return TRUE;
}


// ����������� [!output SERVER_ITEM_CLASS]

#ifdef _DEBUG
void [!output SERVER_ITEM_CLASS]::AssertValid() const
{
	[!output SERVER_ITEM_BASE_CLASS]::AssertValid();
}

void [!output SERVER_ITEM_CLASS]::Dump(CDumpContext& dc) const
{
	[!output SERVER_ITEM_BASE_CLASS]::Dump(dc);
}
#endif

