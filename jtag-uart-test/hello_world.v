module hello_world(
	iCLK_50,
	oDRAM_CAS_N,
	oDRAM_CKE,
	oDRAM_CS_N,
	oDRAM_RAS_N,
	oDRAM_WE_N,
	oDRAM_CLK,
	DRAM_DQ,
	oDRAM_A,
	oDRAM_BA,
	oDRAM_DQM,
	oLEDG
);


input wire	iCLK_50;
output wire	oDRAM_CAS_N;
output wire	oDRAM_CKE;
output wire	oDRAM_CS_N;
output wire	oDRAM_RAS_N;
output wire	oDRAM_WE_N;
output wire	oDRAM_CLK;
inout wire	[15:0] DRAM_DQ;
output wire	[11:0] oDRAM_A;
output wire	[1:0] oDRAM_BA;
output wire	[1:0] oDRAM_DQM;
output wire	[7:0] oLEDG;

wire	clk_sig;
wire	SYNTHESIZED_WIRE_0;

assign	SYNTHESIZED_WIRE_0 = 1;




cpu	b2v_inst(
	.clk_clk(clk_sig),
	.reset_reset_n(SYNTHESIZED_WIRE_0),
	.sdram_wire_dq(DRAM_DQ),
	.sdram_wire_cas_n(oDRAM_CAS_N),
	.sdram_wire_cke(oDRAM_CKE),
	.sdram_wire_cs_n(oDRAM_CS_N),
	.sdram_wire_ras_n(oDRAM_RAS_N),
	.sdram_wire_we_n(oDRAM_WE_N),
	.sdram_wire_addr(oDRAM_A),
	.sdram_wire_ba(oDRAM_BA),
	
	.sdram_wire_dqm(oDRAM_DQM));


assign	clk_sig = iCLK_50;
assign	oDRAM_CLK = clk_sig;

endmodule
