#pragma once

using namespace System;
using namespace System::ComponentModel;
using namespace System::Collections;
using namespace System::Diagnostics;


[!output SAFE_NAMESPACE_BEGIN]
	/// <summary>
	/// [!output SAFE_ITEM_NAME] ժҪ
	/// </summary>
	public ref class [!output SAFE_ITEM_NAME] :  public System::ComponentModel::Component
	{
	public:
		[!output SAFE_ITEM_NAME](void)
		{
			InitializeComponent();
			//
			//TODO:  �ڴ˴���ӹ��캯������
			//
		}
		[!output SAFE_ITEM_NAME](System::ComponentModel::IContainer ^container)
		{
			/// <summary>
			/// Windows.Forms ��׫д�����֧���������
			/// </summary>

			container->Add(this);
			InitializeComponent();
		}

	protected:
		/// <summary>
		/// ������������ʹ�õ���Դ��
		/// </summary>
		~[!output SAFE_ITEM_NAME]()
		{
			if (components)
			{
				delete components;
			}
		}

	private:
		/// <summary>
		/// ����������������
		/// </summary>
		System::ComponentModel::Container ^components;

#pragma region Windows Form Designer generated code
		/// <summary>
		/// �����֧������ķ��� - ��Ҫ�޸�
		/// ʹ�ô���༭���޸Ĵ˷��������ݡ�
		/// </summary>
		void InitializeComponent(void)
		{
			components = gcnew System::ComponentModel::Container();
		}
#pragma endregion
	};
[!output SAFE_NAMESPACE_END]
