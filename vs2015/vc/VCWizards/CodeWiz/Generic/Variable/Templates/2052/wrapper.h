#pragma once

// ������������� Microsoft Visual C++ ������ IDispatch ��װ����

// ע��:  ��Ҫ�޸Ĵ��ļ������ݡ�  ���������
//  Microsoft Visual C++ �������ɣ������޸Ľ������ǡ�

/////////////////////////////////////////////////////////////////////////////
// [!output CLASS_NAME] ��װ����

class [!output CLASS_NAME] : public CWnd
{
protected:
	DECLARE_DYNCREATE([!output CLASS_NAME])
public:
	CLSID const& GetClsid()
	{
		static CLSID const clsid
			= [!output CONTROL_CLSID];
		return clsid;
	}
	virtual BOOL Create(LPCTSTR lpszClassName, LPCTSTR lpszWindowName, DWORD dwStyle,
						const RECT& rect, CWnd* pParentWnd, UINT nID, 
						CCreateContext* pContext = NULL)
	{ 
		return CreateControl(GetClsid(), lpszWindowName, dwStyle, rect, pParentWnd, nID); 
	}

    BOOL Create(LPCTSTR lpszWindowName, DWORD dwStyle, const RECT& rect, CWnd* pParentWnd, 
				UINT nID, CFile* pPersist = NULL, BOOL bStorage = FALSE,
				BSTR bstrLicKey = NULL)
	{ 
		return CreateControl(GetClsid(), lpszWindowName, dwStyle, rect, pParentWnd, nID,
		pPersist, bStorage, bstrLicKey); 
	}

// ����
public:
[!output CLASS_ENUMS]

// ����
public:

[!output CLASS_TEXT]

};
